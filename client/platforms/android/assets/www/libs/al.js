(function() {

'use strict';

var al = angular.module('al', [], function () {
	Object.defineProperties(Object.prototype, {
		prop: {
			configurable: true,
			writable: true,
			value: function (argA, argB) {
				var self = this;

				if(angular.isNumber(argA)) {
					argA = String(argA);
				}
				if(angular.isString(argA)) {
					var jointKey = argA;
					var keys = jointKey.trim().find(/(?:['"])([^'"]*)(?:['"])|([^\s'"]+)(?=\s+|$)/g);

					if(arguments.length == 1) {
						var mapVal = jointKey.slice(-1) == ' ';

						if(keys.length == 1 && !mapVal) {
							var key = keys[0];

							return self[key];
						} else {
							var valMap = {};

							angular.forEach(keys, function (key) {
								valMap[key] = self.prop(key);
							});

							return valMap;
						}
					} else {
						var val = argB;

						angular.forEach(keys, function (key) {
							var hidden = key.slice(0, 1) == '.' || key.slice(1, 1) == '.';
							var get = key.slice(0, 1) == '=';
							var set = key.slice(-1) == '=';

							key = key.trimStr('=').trimStr('.', 'left');

							if(!(get || set)) {
								Object.defineProperty(self, key, {
									configurable: true,
									enumerable: !hidden,
									writable: true,
									value: val
								});
							} else if (!set) {
								Object.defineProperty(self, key, {
									configurable: true,
									enumerable: !hidden,
									get: val
								});
							} else if (!get) {
								Object.defineProperty(self, key, {
									configurable: true,
									enumerable: !hidden,
									set: val
								});
							} else {
								Object.defineProperty(self, key, {
									configurable: true,
									enumerable: !hidden,
									get: val.get,
									set: val.set
								});
							}
						});

						return self;
					}
				} else {
					var valMap = argA;

					angular.forEach(valMap, function (val, key) {
						self.prop(key, val);
					});

					return self;
				}
			}
		},
		del: {
			configurable: true,
			writable: true,
			value: function (jointKey) {
				if(angular.isNumber(jointKey)) {
					jointKey = String(jointKey);
				}

				var self = this;
				var keys = jointKey.trim().find(/(?:['"])([^'"]*)(?:['"])|([^\s'"]+)(?=\s+|$)/g);

				if(keys.length == 1) {
					var key = keys[0];

					delete self[key];
				} else {
					angular.forEach(keys, function (key) {
						self.del(key);
					});
				}

				return self;
			}
		},
		has: {
			configurable: true,
			writable: true,
			value: function (key) {
				return key in this;
			}
		},
		normalize: {
			configurable: true,
			writable: true,
			value: function (depth) {
				var self = this;

				depth = angular.isNumber(depth) ? --depth : Number.POSITIVE_INFINITY;

				angular.forEach(self, function (val, jointKey) {
					if(depth && angular.isObject(val)) {
						self[jointKey] = val.normalize(depth);
					}

					var keys = jointKey.find(/(?:['"])([^'"]*)(?:['"])|([^\s'"]+)(?=\s+|$)/g);

					if(keys.length > 1) {
						angular.forEach(keys, function (key) {
							self[key] = self[jointKey];
						});

						self.del(jointKey.quote());
					}
				});

				return self;
			}
		},
		guid: {
			configurable: true,
			get: function () {
				if(!this.has('$guid')) {
					this.$guid = '%u'.format(Date.now());
				}

				return this.$guid;
			}
		},
		watch: {
			configurable: true,
			writable: true,
			value: function (argA, argB) {
				var self = this;

				if(angular.isNumber(argA)) {
					argA = String(argA);
				}
				if(angular.isString(argA)) {
					var jointKey = argA;
					var keys = jointKey.trim().find(/(?:['"])([^'"]*)(?:['"])|([^\s'"]+)(?=\s+|$)/g);
					var mapUnwatchFuncs = jointKey.slice(-1) == ' ';

					if(keys.length == 1 && !mapUnwatchFuncs) {
						var key = keys[0];
						var $key = '$%s'.format(key);
						var watchFunc = argB;

						if(!self.has('$watches')) {
							self.$watches = {
								keys: {},
								count: 0
							};
						}
						if(!self.$watches.keys.has(key)) {
							self.$watches.keys[key] = {
								funcs: {},
								count: 0
							};
							self[$key] = self[key];

							self.prop('=%s='.format(key), {
								get: function () {
									return self[$key];
								},
								set: function (newVal) {
									var oldVal = self[$key];

									self[$key] = newVal;

									angular.forEach(self.$watches.keys[key].funcs, function (watchFunc) {
										watchFunc(newVal, oldVal, key, self);
									});
								}
							});

							self.$watches.count++;
						}

						self.$watches.keys[key].funcs[watchFunc.guid] = watchFunc;
						self.$watches.keys[key].count++;

						var unwatchFunc = function () {
							self.$watches.keys[key].funcs.del(watchFunc.guid);

							if(!--self.$watches.keys[key].count) {
								self.$watches.keys.del(key);

								if(self.has(key)) {
									self.del(key);

									self[key] = self[$key];
								}

								self.del($key);

								if(!--self.$watches.count) {
									self.del('$watches');
								}
							}
						};

						return unwatchFunc;
					} else {
						var watchFunc = argB;
						var unwatchFuncs = {};

						angular.forEach(keys, function (key) {
							unwatchFuncs[key] = self.watch(key, watchFunc);
						});

						return unwatchFuncs;
					}
				} else {
					var watchFuncs = argA.normalize(1);
					var unwatchFuncs = {};

					angular.forEach(watchFuncs, function (watchFunc, key) {
						unwatchFuncs[key] = self.watch(key, watchFunc);
					});

					return unwatchFuncs;
				}
			}
		},
		toArray: {
			configurable: true,
			writable: true,
			value: function () {
				var array = [];

				angular.forEach(this, function (val) {
					array.push(val);
				});

				return array;
			}
		}
	});
	Object.defineProperty(Function.prototype, 'defer', {
		configurable: true,
		writable: true,
		value: function (preArgs, arrayPostArgs, that) {
			var self = this;

			return function (postArgs) {
				var jointArgs = (preArgs || []).concat(!arrayPostArgs ? arguments.toArray() : postArgs);

				return !angular.isUndefined(that) ? self.apply(that, jointArgs) : self.apply(this, jointArgs);
			}.prop('undefered', self);
		}
	});
	Object.defineProperties(Array.prototype, {
		find: {
			configurable: true,
			writable: true,
			value: function (item, comparator, sort) {
				var lowIdx = 0;
				var highIdx = this.length - 1;
				var midIdx = 0;
				var midItem = null;
				var comparision = null;

				while(lowIdx <= highIdx) {
			    	midIdx = ((lowIdx + highIdx) >> 1) | 0;
			    	midItem = this[midIdx];
			    	comparision = comparator(item, midItem);

					if(comparision > 0) {
						lowIdx = midIdx + 1;
					}
					else if(comparision < 0) {
						highIdx = midIdx - 1;
					}
					else {
						return midIdx;
					}
				}

				return !sort ? -1 : midIdx;
			}
		},
		arrayWatch: {
			configurable: true,
			writable: true,
			value: function (addWatchFunc, delWatchFunc, setWatchFunc) {
				var self = this;

				if(!self.has('$arrayWatches')) {
					self.$arrayWatches = {
						funcs: {},
						count: 0
					};
					self.$arrayUnwatches = [];

					var arrayOp = false;
					var watchFunc = function (newItem, oldItem, idx) {
						if(!arrayOp) {
							angular.forEach(self.$arrayWatches.funcs, function (watchFuncs) {
								watchFuncs.setFunc(newItem, oldItem, idx, self);
							});
						}
					};

					angular.forEach(self, function (item, idx) {
						self.$arrayUnwatches.push(self.watch(idx, watchFunc));
					});

					self.prop({
						$push: self.push.defer(null, true),
						$pop: self.pop.defer(null),
						$unshift: self.unshift.defer(null, true),
						$shift: self.shift.defer(null),
						$splice: self.splice.defer(null, true),
						push: function () {
							arrayOp = true;

							var items = arguments.toArray();
							var idx = self.length;
							var size = self.$push(items);

							if(items.length) {
								var unwatchFuncs = self.watch('%s '.format(Math.range(idx, idx + items.length - 1).join(' ')), watchFunc).toArray();

								angular.forEach(unwatchFuncs, function (unwatchFunc) {
									self.$arrayUnwatches.push(unwatchFunc);
								});

								angular.forEach(self.$arrayWatches.funcs, function (watchFuncs) {
									watchFuncs.addFunc(items);
								});
							}

							arrayOp = false;

							return size;
						},
						pop: function () {
							arrayOp = true;

							var items = [self.$pop()];
							var unwatchFunc = self.$arrayUnwatches.pop();

							unwatchFunc();

							angular.forEach(self.$arrayWatches.funcs, function (watchFuncs) {
								watchFuncs.delFunc(items);
							});

							arrayOp = false;

							return items[0];
						},
						unshift: function () {
							arrayOp = true;

							var items = arguments.toArray();
							var idx = 0;
							var size = self.$unshift(items);

							if(items.length) {
								var unwatchFuncs = self.watch('%s '.format(Math.range(idx, idx + items.length - 1).join(' ')), watchFunc).toArray();

								angular.forEach(unwatchFuncs, function (unwatchFunc) {
									self.$arrayUnwatches.unshift(unwatchFunc);
								});

								angular.forEach(self.$arrayWatches.funcs, function (watchFuncs) {
									watchFuncs.addFunc(items);
								});
							}

							arrayOp = false;

							return size;
						},
						shift: function () {
							arrayOp = true;

							var items = [self.$shift()];
							var unwatchFunc = self.$arrayUnwatches.shift();

							unwatchFunc();

							angular.forEach(self.$arrayWatches.funcs, function (watchFuncs) {
								watchFuncs.delFunc(items);
							});

							arrayOp = false;

							return items[0];
						},
						splice: function (idx, size) {
							arrayOp = true;

							var addedItems = arguments.toArray().slice(2);
							var removedItems = self.$splice([idx, size].concat(addedItems));

							if(removedItems.length) {
								angular.forEach(self.$arrayUnwatches.splice(idx, size), function (unwatchFunc) {
									unwatchFunc();
								});
							}
							if(addedItems.length) {
								var unwatchFuncs = self.watch('%s '.format(Math.range(idx, idx + addedItems.length - 1).join(' ')), watchFunc).toArray();

								angular.forEach(unwatchFuncs, function (unwatchFunc, offset) {
									self.$arrayUnwatches.splice(idx + offset, 0, unwatchFunc);
								});
							}

							angular.forEach(self.$arrayWatches.funcs, function (watchFuncs) {
								if(addedItems.length) {
									watchFuncs.addFunc(addedItems);
								}
								if(removedItems.length) {
									watchFuncs.delFunc(removedItems);
								}
							});

							arrayOp = false;

							return removedItems;
						}
					});
				}

				var jointGuid = '%s %s %s'.format(addWatchFunc.guid, delWatchFunc.guid, setWatchFunc.guid);

				self.$arrayWatches.funcs[jointGuid] = {
					addFunc: addWatchFunc,
					delFunc: delWatchFunc,
					setFunc: setWatchFunc
				};
				self.$arrayWatches.count++;

				var unwatchFunc = function () {
					self.$arrayWatches.funcs.del(jointGuid);

					if(!--self.$arrayWatches.count) {
						angular.forEach(self.$arrayUnwatches, function (unwatchFunc) {
							unwatchFunc();
						});

						self.prop({
							push: self.$push.undefered,
							pop: self.$pop.undefered,
							unshift: self.$unshift.undefered,
							shift: self.$shift.undefered,
							splice: self.$splice.undefered
						});

						self.del('$push $pop $unshift $shift $splice $arrayWatches $arrayUnwatches');
					}
				};

				return unwatchFunc;
			}
		},
		idx: {
			configurable: true,
			writable: true,
			value: function (keys, format, unique) {
				var self = this;
				var keysWatchFunc = function (newVal, oldVal, key, item) {
					angular.forEach(self.$idxes, function (idx) {
						var itemOldKey = idx.format.arrayFormat(item.prop('%s '.format(idx.keys)).prop(key, oldVal).toArray());
						var itemNewKey = idx.format.arrayFormat(item.prop('%s '.format(idx.keys)).toArray());

						self.del(itemOldKey)[itemNewKey] = item;
					});
				};

				if(!self.has('$idxes')) {
					self.$idxes = [];

					var addWatchFunc = function (items) {
						angular.forEach(self.$idxes, function (idx) {
							angular.forEach(items, function (item) {
								var itemKey = idx.format.arrayFormat(item.prop('%s '.format(idx.keys)).toArray());

								self[itemKey] = item;

								item.watch(idx.keys, keysWatchFunc);
							});
						});
					};
					var delWatchFunc = function (items) {
						angular.forEach(self.$idxes, function (idx) {
							angular.forEach(items, function (item) {
								var itemKey = idx.format.arrayFormat(item.prop('%s '.format(idx.keys)).toArray());

								self.del(itemKey);
							});
						});
					};
					var setWatchFunc = function (newItem, oldItem) {
						angular.forEach(self.$idxes, function (idx) {
							var oldItemKey = idx.format.arrayFormat(oldItem.prop('%s '.format(idx.keys)).toArray());
							var newItemKey = idx.format.arrayFormat(newItem.prop('%s '.format(idx.keys)).toArray());

							self.del(oldItemKey)[newItemKey] = newItem;

							newItem.watch(idx.keys, keysWatchFunc);
						});
					};

					self.arrayWatch(addWatchFunc, delWatchFunc, setWatchFunc);
				}

				angular.forEach(self, function (item) {
					var itemKey = format.arrayFormat(item.prop('%s '.format(keys)).toArray());

					if(unique) {
						self[itemKey] = item;
					} else {
						self[itemKey] = (self[itemKey] || []).push(item);
					}

					item.watch(keys, keysWatchFunc);
				});

				self.$idxes.push({
					keys: keys,
					format: format,
					unique: unique
				});

				return self;
			}
		},
		view: {
			configurable: true,
			writable: true,
			value: function (keys, filter, sorter) {
				var self = this;
				var bindFunc = function () {
					self.$views.push(this);

					this.del('bind').unbind = unbindFunc;
				};
				var unbindFunc = function () {
					var views = self.$views;

					views.splice(views.indexOf(this));

					this.del('unbind').bind = bindFunc;
				};
				var keysWatchFunc = function (newVal, oldVal, key, item) {
					angular.forEach(self.$views, function (view) {
						var itemOldIdx = view.indexOf(item);

						if(itemOldIdx) {
							view.splice(itemOldIdx, 1);
						}

						if(view.$filter(item)) {
							var itemNewIdx = view.$sorter(item);

							view.splice(itemNewIdx, 0, item);
						}
					});
				};

				if(!self.has('$views')) {
					self.$views = [];

					var addWatchFunc = function (items) {
						angular.forEach(self.$views, function (view) {
							angular.forEach(items, function (item) {
								if(view.$filter(item)) {
									var itemIdx = view.$sorter(item);

									view.splice(itemIdx, 0, item);
								}

								item.watch(view.$keys, keysWatchFunc);
							});
						});
					};
					var delWatchFunc = function (items) {
						angular.forEach(self.$views, function (view) {
							angular.forEach(items, function (item) {
								var itemIdx = view.indexOf(item);

								if(itemIdx) {
									view.splice(itemIdx, 1);
								}
							});
						});
					};
					var setWatchFunc = function (newItem, oldItem) {
						angular.forEach(self.$views, function (view) {
							var oldItemIdx = view.indexOf(oldItem);

							if(oldItemIdx) {
								view.splice(oldItemIdx, 1);
							}

							if(view.$filter(newItem)) {
								var newItemIdx = view.$sorter(newItem);

								view.splice(newItemIdx, 0, newItem);
							}

							newItem.watch(view.$keys, keysWatchFunc);
						});
					};

					self.arrayWatch(addWatchFunc, delWatchFunc, setWatchFunc);
				}

				var view = [].prop({
					$keys: keys,
					$filter: filter,
					$sorter: function (item) {
						return this.find(item, sorter, true);
					},
					bind: bindFunc
				});

				angular.forEach(self, function (item) {
					if(view.$filter(item)) {
						var itemIdx = view.$sorter(item);

						view.splice(itemIdx, 0, item);
					}

					item.watch(view.$keys, keysWatchFunc);
				});

				return view;
			}
		},
		page: {
			configurable: true,
			writable: true,
			value: function (pageNo, pageLen) {
				var start = (pageNo - 1) * pageLen;
				var end = start + pageLen;

				return this.slice(start, end);
			}
		},
		extract: {
			configurable: true,
			writable: true,
			value: function (keys) {
				return this.map(function (item) {
					return item.prop(keys)
				});
			}
		}
	});
	Object.defineProperties(String.prototype, {
		format: {
			configurable: true,
			writable: true,
			value: function () {
				return vsprintf(this, arguments.toArray());
			}
		},
		arrayFormat: {
			configurable: true,
			writable: true,
			value: function (args) {
				return vsprintf(this, args);
			}
		},
		quote: {
			configurable: true,
			writable: true,
			value: function () {
				return '\'%s\''.format(this);
			}
		},
		escape: {
			configurable: true,
			writable: true,
			value: function () {
				return this.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
			}
		},
		toCase: {
			configurable: true,
			writable: true,
			value: function (format, start, end) {
				if(angular.isNumber(start)) {
					if(angular.isNumber(end)) {
						var str = this.slice(start, end);
						var preStr = this.slice(0, start);
						var postStr = this.slice(end);
					} else {
						var str = this.slice(start, start + 1);
						var preStr = this.slice(0, start);
						var postStr = this.slice(start + 1);
					}
				} else {
					var str = this;
					var preStr = '';
					var postStr = '';
				}

				var formaters = {
					small: 'toLowerCase',
					capital: 'toUpperCase'
				};

				return '%s%s%s'.format(preStr, str[formaters[format]](), postStr);
			}
		},
		toConv: {
			configurable: true,
			writable: true,
			value: function (type) {
				var formats = {
					small: {
						letterCase: 'small',
						separator: ''
					},
					capital: {
						letterCase: 'capital',
						separator: ''
					},
					camel: {
						letterCase: 'small',
						separator: ''
					},
					smallUnderscore: {
						letterCase: 'small',
						separator: '_'
					},
					capitalUnderscore: {
						letterCase: 'capital',
						separator: '_'
					},
					smallDash: {
						letterCase: 'small',
						separator: '-'
					},
					capitalDash: {
						letterCase: 'capital',
						separator: '-'
					}
				};
				var format = formats[type];
				var letterCase = format.letterCase;
				var separator = format.separator;
				var tokens = this.replace(/([0-9a-z])([A-Z])|_|-/g, '$1 $2').match(/(?:'|")([^'|"]*)(?:'|")|([^\s'|"]+)(?=\s+|$)/g);

				angular.forEach(tokens, function (token, idx) {
					tokens[idx] = token.toCase(letterCase);

					if(type == 'camel' && idx) {
						tokens[idx] = token.toCase('capital', 0);
					}
				});

				return tokens.join(separator);
			}
		},
		trimStr: {
			configurable: true,
			writable: true,
			value: function (str, type) {
				var formats = {
					left: '^(%s)*',
					right: '(%s)*$',
					both: '^(%1$s)*|(%1$s)*$'
				};

				return this.replace(new RegExp(formats[type || 'both'].format(str.escape()), 'g'), '');
			}
		},
		find: {
			configurable: true,
			writable: true,
			value: function (expr) {
				var regex = !angular.isString(expr) ? expr : new RegExp(expr);
				var matches = [];
				var match = null;
				var extract = function (matches) {
					var match = null;

					if(matches) {
						while(!match) {
							match = matches.pop();
						}
					}

					return match;
				};

				while(match = extract(regex.exec(this))) {
					matches.push(match);

					if(!regex.global) {
						break;
					}
				}

				return matches;
			}
		}
	});
	Object.defineProperty(Math, 'range', {
		configurable: true,
		writable: true,
		value: function (start, end) {
			var range = [];

			for(var idx = start; idx <= end; idx++) {
				range.push(idx);
			}

			return range;
		}
	});
});

al.constant('configs', {
	protoVer: 1,
	queryUrl: 'http://dev-alcode.appengine.flow.ch/al.php',
	gcmId: '928062559637'
});

al.directive('alEvents', ['$parse', 'events', function (parse, events) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {
			attrs.$observe('alEvents', function (attrVal) {
				var exprsMap = scope.$eval(attrVal);

				angular.forEach(exprsMap, function (expr, eventKeys) {
					var exprFunc = parse(expr);
					var eventsHandler = function (event) {
						exprFunc(scope, {
							$event: event
						});
					};

					events.bind(scope, elem, eventKeys, eventsHandler);
				});
			});
		}
	};
}]);

al.directive('alStates', ['$animate', '$parse', function (animate, parse) {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {
			attrs.$observe('alStates', function (attrVal) {
				var exprsMap = scope.$eval(attrVal);

				angular.forEach(exprsMap, function (expr, elemStates) {
					scope.$watch(parse(expr), function (exprState) {
						var filteredElemStates = elemStates.replace(/\s?hide(\s|$)/g, '');

						if(filteredElemStates) {
							elem.toggleClass(elemStates, exprState);
						}
						if(filteredElemStates != elemStates) {
							animate[exprState ? 'addClass' : 'removeClass'](elem, 'ng-hide');
						}
					});
				});
			});
		}
	};
}]);

al.directive('alOption', ['events', function (events) {
	return {
		restrict: 'A',
		require: '?ngModel',
		link: function (scope, elem, attrs, model) {
			var groupOption = scope.$groupOption = scope.$groupOption || {};

			attrs.$observe('alOption', function (attrVal) {
				var expr = scope.$eval(attrVal) || attrVal;
				var selectHandlers = {
					select: function () {
						elem.addClass('selected');
					},
					toggle: function () {
						elem.toggleClass('selected');
					}
				};

				if(angular.isString(expr)) {
					var action = expr;
				} else {
					var action = expr.action;
					var group = expr.group;
				}

				events.bind(scope, elem, 'tap', selectHandlers[action]);

				var selectWatch = function() {
					return elem.hasClass('selected');
				};

				scope.$watch(selectWatch, function(elemState) {
					events.trigger(elem, 'select', {selectState: elemState});
				});

				if(group) {
					scope.$watch(selectWatch, function (elemState) {
						var selectedElem = groupOption[group];

						if(elemState) {
							groupOption[group] = elem;

							if(selectedElem) {
								selectedElem.removeClass('selected');
							}
						} else {
							if(selectedElem == elem) {
								groupOption.del(group);
							}
						}
					});
				}
				if(model) {
					scope.$watch(selectWatch, function (elemState) {
						if(model.$viewValue != elemState) {
							model.$setViewValue(elemState);
						}
					});

					model.$render = function () {
						elem.toggleClass('selected', model.$viewValue || false);
					};

					model.$render();
				}
			});
		}
	};
}]);

al.factory('events', ['$document', function (doc) {
	Hammer.gestures.Swipe.defaults.swipe_velocity = 0.05;

	var touchEventKeys = '%s %s %s %s %s %s %s'.format(
		'touch hold release',
		'tap dbltap',
		'swipe swipeup swipedown swipeleft swiperight',
		'rotate',
		'pinch pinchin pinchout',
		'transform transformstart transformend',
		'drag dragstart dragend dragup dragdown dragleft dragright'
	).split(' ');
	var self = {
		bind: function (scope, elem, argA, argB) {
			if(angular.isString(argA)) {
				var jointKey = argA;
				var eventKeys = jointKey.trim().find(/(?:['"])([^'"]*)(?:['"])|([^\s'"]+)(?=\s+|$)/g);
				var mapUnbindFuncs = jointKey.slice(-1) == ' ';

				if(eventKeys.length == 1 && !mapUnbindFuncs) {
					var eventKey = eventKeys[0];
					var eventHandler = argB;
					var watchedEventHandler = function (event) {
						if(scope.$$phase) {
							eventHandler(event);
						} else {
							scope.$apply(eventHandler.defer([event]));
						}
					};

					Hammer(elem[0]).on(eventKey, watchedEventHandler);

					var unbindFunc = function () {
						Hammer(elem[0]).off(eventKey, watchedEventHandler);
					};

					return unbindFunc;
				} else {
					var eventsHandler = argB;
					var unbindFuncs = {};

					angular.forEach(eventKeys, function (eventKey) {
						unbindFuncs[eventKey] = self.bind(scope, elem, eventKey, eventsHandler);
					});

					return unbindFuncs;
				}
			} else {
				var eventsHandlersMap = argA.normalize();
				var unbindFuncs = {};

				angular.forEach(eventsHandlersMap, function (eventsHandler, eventKey) {
					unbindFuncs[eventKeys] = self.bind(scope, elem, eventKey, eventsHandler);
				});

				return unbindFuncs;
			}
		},
		trigger: function(elem, argA, argB) {
			if(angular.isString(argA)) {
				var eventKeys = argA.trim().find(/(?:['"])([^'"]*)(?:['"])|([^\s'"]+)(?=\s+|$)/g);
				var eventData = argB;

				angular.forEach(eventKeys, function (eventKey) {
					if(touchEventKeys.indexOf(eventKey) == -1) {
						var event = doc[0].createEvent('Event');

						event.initEvent(eventKey, true, true);

						elem[0].dispatchEvent(angular.extend(event, eventData));
					} else {
						Hammer(elem[0]).trigger(eventKey, eventData || {});
					}
				});
			} else {
				var eventDataMap = argA;

				angular.forEach(eventDataMap, function (eventData, eventKeys) {
					self.trigger(elem, eventKeys, eventData);
				});
			}

			return this;
		}
	};

	return self;
}]);

al.factory('device', function () {
	return {}.prop({
		'=id': function () {
			return device.uuid;
		},
		'=model': function () {
			return device.model;
		},
		'=platform': function () {
			return device.platform.toCase('small');
		},
		'=platformVer': function () {
			return device.version;
		},
		'=cordovaVer': function () {
			return device.cordova;
		}
	});
});

al.factory('storage', ['$timeout', 'device', function (timeout, device) {
	var formats = {
		pdf: 'application/pdf',
		doc: 'application/msword'
	};
	var Entry = function (scope, entry) {
		var path = entry.fullPath;

		this.$scope = scope;
		this.$entry = entry;
		this.$type = entry.isDirectory ? 'dir' : 'file';
		this.$format = formats[path.slice(path.lastIndexOf('.') + 1)]
		this.$path = path.trimStr('file://', 'left');

		return this;
	};

	Entry.prototype.prop({
		'=name': function () {
			return this.$entry.name;
		},
		'=type': function () {
			return this.$type;
		},
		'=format': function () {
			return this.$format;
		},
		'=path': function () {
			return this.$path;
		},
		'=url': function () {
			return this.$entry.toURL();
		},
		meta: function (errFunc, successFunc, meta) {
			var self = this;
			var scope = self.$scope;
			var watchedErrFunc = errFunc ? function (details) {
				details.func = 'meta';
				details.target = self.url;
				details.entry = self;

				if(scope.$$phase) {
					errFunc(details);
				} else {
					scope.$apply(errFunc.defer([details]));
				}
			} : undefined;
			var watchedSuccessFunc = successFunc ? function (meta) {
				if(scope.$$phase) {
					successFunc(meta);
				} else {
					scope.$apply(successFunc.defer([meta]));
				}
			} : undefined;

			if(arguments.length < 3) {
				self.$entry.getMetadata(watchedSuccessFunc, watchedErrFunc);
			} else {
				self.$entry.setMetadata(watchedSuccessFunc, watchedErrFunc, meta);
			}

			return self;
		},
		parent: function (errFunc, successFunc) {
			var self = this;
			var scope = self.$scope;
			var watchedErrFunc = errFunc ? function (details) {
				details.func = 'parent';
				details.target = self.url;
				details.entry = self;

				if(scope.$$phase) {
					errFunc(details);
				} else {
					scope.$apply(errFunc.defer([details]));
				}
			} : undefined;
			var watchedSuccessFunc = successFunc ? function (parent) {
				parent = new Entry(scope, parent);

				if(scope.$$phase) {
					successFunc(parent);
				} else {
					scope.$apply(successFunc.defer([parent]));
				}
			} : undefined;

			self.$entry.getParent(watchedSuccessFunc, watchedErrFunc);

			return self;
		},
		dir: function (path, opts, errFunc, successFunc) {
			var self = this;
			var scope = self.$scope;
			var dirs = !(opts && opts.create && opts.recursive) ? [path = path.trimStr('/')] : (path = path.trimStr('/')).split('/');
			var name = dirs.pop();
			var watchedErrFunc = errFunc ? function (details) {
				details.func = 'dir';
				details.target = '%s/%s'.format(self.url, path);
				details.entry = self;

				if(scope.$$phase) {
					errFunc(details);
				} else {
					scope.$apply(errFunc.defer([details]));
				}
			} : undefined;
			var watchedSuccessFunc = successFunc ? function (dir) {
				dir = new Entry(scope, dir);

				if(scope.$$phase) {
					successFunc(dir);
				} else {
					scope.$apply(successFunc.defer([dir]));
				}
			} : undefined;
			var createFunc = function (dir) {
				dir.$entry.getDirectory(name || '/', opts, watchedSuccessFunc, watchedErrFunc);
			};

			if(!dirs.length) {
				createFunc(self);
			} else {
				var jointDir = dirs.join('/');

				self.dir(jointDir, opts, errFunc, createFunc);
			}

			return self;
		},
		file: function (path, opts, errFunc, successFunc) {
			var self = this;
			var scope = self.$scope;
			var dirs = (path = path.trimStr('/')).split('/');
			var name = dirs.pop();
			var watchedErrFunc = errFunc ? function (details) {
				details.func = 'file';
				details.target = '%s/%s'.format(self.url, path);
				details.entry = self;

				if(scope.$$phase) {
					errFunc(details);
				} else {
					scope.$apply(errFunc.defer([details]));
				}
			} : undefined;
			var watchedSuccessFunc = successFunc ? function (file) {
				file = new Entry(scope, file);

				if(scope.$$phase) {
					successFunc(file);
				} else {
					scope.$apply(successFunc.defer([file]));
				}
			} : undefined;
			var createFunc = function (dir) {
				dir.$entry.getFile(name, opts, watchedSuccessFunc, watchedErrFunc);
			};

			if(!dirs.length) {
				createFunc(self);
			} else {
				var jointDir = dirs.join('/');

				self.dir(jointDir, opts, errFunc, createFunc);
			}

			return self;
		},
		copy: undefined,
		move: undefined,
		remove: function (errFunc, successFunc) {
			var self = this;
			var scope = self.$scope;
			var watchedErrFunc = errFunc ? function (details) {
				details.func = 'remove';
				details.target = self.url;
				details.entry = self;

				if(scope.$$phase) {
					errFunc(details);
				} else {
					scope.$apply(errFunc.defer([details]));
				}
			} : undefined;
			var watchedSuccessFunc = successFunc ? function () {
				if(scope.$$phase) {
					successFunc();
				} else {
					scope.$apply(successFunc);
				}
			} : undefined;

			if(self.type == 'dir') {
				self.$entry.removeRecursively(watchedSuccessFunc, watchedErrFunc);
			} else {
				self.$entry.remove(watchedSuccessFunc, watchedErrFunc);
			}

			return self;
		},
		iter: undefined,
		reader: undefined,
		writer: undefined,
		open: function () {
			return cordova.plugins.fileOpener.open(this.url, this.format);
		},
		download: function (url, authCerts, opts, errFunc, successFunc, progressFunc) {
			var self = this;
			var scope = self.$scope;
			var updateProgress = true;
			var watchedErrFunc = errFunc ? function (details) {
				details.func = 'download';
				details.entry = self;

				if(scope.$$phase) {
					errFunc(details);
				} else {
					scope.$apply(errFunc.defer([details]));
				}
			} : undefined;
			var watchedSuccessFunc = successFunc ? function (download) {
				download = new Entry(scope, download);

				if(scope.$$phase) {
					successFunc(download);
				} else {
					scope.$apply(successFunc.defer([download]));
				}
			} : undefined;
			var watchedProgressFunc = progressFunc ? function (status) {
				if(updateProgress) {
					updateProgress = false;

					status.loaded = device.platform == 'android' ? Math.round(status.loaded / 2) : status.loaded;

					if(scope.$$phase) {
						progressFunc(status);
					} else {
						scope.$apply(progressFunc.defer([status]));
					}

					timeout(function () {
						updateProgress = true;
					}, 500, false);
				}
			} : undefined;
			var http = new FileTransfer();

			http.onprogress = watchedProgressFunc;

			http.download(url, self.path, watchedSuccessFunc, watchedErrFunc, !authCerts, opts);

			return http.abort.defer([watchedSuccessFunc, watchedErrFunc], false, http);
		},
		upload: undefined
	});

	return function (scope, url, errFunc, successFunc) {
		var watchedErrFunc = errFunc ? function (details) {
			details.func = 'storage';
			details.target = url;

			if(scope.$$phase) {
				errFunc(details);
			} else {
				scope.$apply(errFunc.defer([details]));
			}
		} : undefined;
		var watchedSuccessFunc = successFunc ? function (root) {
			root = new Entry(scope, root);

			if(scope.$$phase) {
				successFunc(root);
			} else {
				scope.$apply(successFunc.defer([root]));
			}
		} : undefined;

		var storage = url.find(/file:\/\/%(\w+)%.*/g)[0];

		if(storage) {
			requestFileSystem(LocalFileSystem[storage], 0, function (storage) {
				resolveLocalFileSystemURI(url.replace(/file:\/\/%\w+%/, storage.root.toURL()), watchedSuccessFunc, watchedErrFunc);
			}, watchedErrFunc);
		} else {
			resolveLocalFileSystemURI(url, watchedSuccessFunc, watchedErrFunc);
		}
	};
}]);

al.factory('cache', ['$timeout', function (timeout) {
	var caches = {
		local: localStorage,
		session: sessionStorage
	};
	var clean = function () {
		var now = Date.now();

		angular.forEach(caches, function (cache) {
			for(var itemIdx = 0; itemIdx < cache.length; itemIdx++) {
				var itemKey = cache.key(itemIdx);

				if(itemKey.match(/\$cache\..+/) && now >= (angular.fromJson(cache.getItem(itemKey)).expiry || 0)) {
					cache.removeItem(itemKey);
				}
			}
		});

		timeout(clean, 3600000);
	};

	clean();

	var self = {
		get: function (cacheKey, arg, itemValidity) {
			var cache = caches[cacheKey];
			var now = Date.now();

			if(angular.isString(arg)) {
				var itemKey = '$cache.%s'.format(arg);
				var item = angular.fromJson(cache.getItem(itemKey));

				if(item) {
					var itemExpiry = angular.isNumber(itemValidity) ? item.date + itemValidity : 0;

					if(itemExpiry != item.expiry) {
						cache.setItem(itemKey, angular.toJson({
							data: item.data,
							date: item.date,
							expiry: itemExpiry
						}));
					}

					if(now < itemExpiry) {
						return item.data;
					} else {
						cache.removeItem(itemKey);
					}
				}
			} else {
				var itemKeys = arg;
				var itemValMap = {};

				angular.forEach(itemKeys, function (itemKey) {
					itemValMap[itemKey] = self.get(cacheKey, itemKey, itemValidity);
				});

				return itemValMap;
			}
		},
		set: function (cacheKey, argA, argB, argC) {
			var cache = caches[cacheKey];
			var now = Date.now();

			if(angular.isString(argA)) {
				var itemKey = '$cache.%s'.format(argA);
				var itemVal = argB;
				var itemValidity = angular.isNumber(argC) ? argC : 0;
				var itemExpiry = now + itemValidity;

				if(itemValidity > 0) {
					cache.setItem(itemKey, angular.toJson({
						data: itemVal,
						date: now,
						expiry: itemExpiry
					}));
				}
			} else {
				var itemsMap = argA;

				angular.forEach(itemsMap, function (item, itemKey) {
					var itemVal = item.data;
					var itemValidity = item.validity;

					self.set(cacheKey, itemKey, itemVal, itemValidity);
				});
			}

			return this;
		},
		remove: function (cacheKey, itemKeys) {
			var cache = caches[cacheKey];

			if(itemKeys) {
				angular.forEach(itemKeys.match(/(?:'|")([^'|"]*)(?:'|")|([^\s'|"]+)(?=\s+|$)/g), function (itemKey) {
					itemKey = '$cache.%s'.format(itemKey);

					cache.removeItem(itemKey);
				});
			} else {
				cache.clear();
			}

			return this;
		}
	};

	return self;
}]);

al.factory('query', ['$http', '$q', 'cache', 'configs', function (http, q, cache, configs) {
	var queryUrl = configs.queryUrl;
	var self = function (scope, arg, queryVer, errFunc, reqFunc, resFunc, resValidity) {
		var queries = scope.$queries = scope.$queries || {};

		if(angular.isString(arg)) {
			var jointKey = arg;
			var queryKeys = jointKey.trim().find(/(?:['"])([^'"]*)(?:['"])|([^\s'"]+)(?=\s+|$)/g);
			var mapQueries = jointKey.slice(-1) == ' ';

			if(queryKeys.length == 1 && !mapQueries) {
				var queryKey = queryKeys[0];
				var queryFunc = null;

				if(arguments.length == 1) {
					queryFunc = queries[queryKey];
				} else {
					queries[queryKey] = queryFunc = function () {
						var req = {
							protoVer: configs.protoVer,
							query: queryKey,
							queryVer: queryVer,
							params: reqFunc ? reqFunc() : {}
						};

						if(resFunc) {
							var cacheKey = '$query.%s'.format(angular.toJson(req));
							var results = cache.get('local', cacheKey, resValidity);

							if(results) {
								resFunc(results);

								return this;
							}
						}

						var abort = q.defer();
						var promise = abort.promise;

						promise.then(function () {
							abort.status = true;
						});

						var post = http.post(queryUrl, req, {timeout: promise});

						if(resFunc) {
							post.success(function (results) {
								cache.set('local', cacheKey, results, resValidity);

								resFunc(results);
							});
						}
						if(errFunc) {
							post.error(function (details, status) {
								errFunc(!abort.status ? status : -1);
							});
						}

						return abort.resolve;
					};
				}

				return queryFunc;
			} else {
				var queryFuncsMap = {};

				angular.forEach(queryKeys, function (queryKey) {
					if(arguments.length == 1) {
						queryFuncsMap[queryKey] = self(scope, queryKey);
					} else {
						queryFuncsMap[queryKey] = self(scope, queryKey, queryVer, errFunc, reqFunc, resFunc, resValidity);
					}
				});

				return queryFuncsMap;
			}
		} else {
			var queriesMap = arg.normalize(1);
			var queryFuncsMap = {};

			angular.forEach(queriesMap, function (query, queryKey) {
				queryFuncsMap[queryKey] = self(scope, queryKey, query.queryVer, query.errFunc, query.reqFunc, query.resFunc, query.resValidity);
			});

			return queryFuncsMap;
		}
	};

	return self;
}]);

al.factory('sync', ['configs', 'query', function (configs, query) {
	var sync = cordova.plugins.pushNotification;
	var gcmId = configs.gcmId;

	return function (scope, regQuery, errFunc, successFunc) {
		var watchedErrFunc = errFunc ? function (details) {
			if(scope.$$phase) {
				errFunc(details);
			} else {
				scope.$apply(errFunc.defer([details]));
			}
		} : undefined;
		var watchedSuccessFunc = successFunc ? function (results) {
			if(scope.$$phase) {
				successFunc(results);
			} else {
				scope.$apply(successFunc.defer([results]));
			}
		} : undefined;

		sync.register(watchedSuccessFunc, watchedErrFunc, {
			senderID: gcmId,
			ecb: function (event) {
			}
		});
	};
}]);

al.factory('facebook', function () {
	return {
		init: function (appId, status, cookie, xfbml) {
			FB.init({
				appId: appId,
				status: status,
				cookie: cookie,
				xfbml: xfbml
	        });
		},
		bind: function (event, handler) {
			var watchedHandler = function (event) {
				if(scope.$$phase) {
					handler(event);
				} else {
					scope.$apply(handler.defer([event]));
				}
			};

			FB.Event.subscribe(event, watchedHandler);

			return function () {
				FB.Event.unsubscribe(event, watchedHandler);
			};
		},
		status: function (handler) {
			var watchedHandler = function (event) {
				if(scope.$$phase) {
					handler(event);
				} else {
					scope.$apply(handler.defer([event]));
				}
			};

			FB.getLoginStatus(watchedHandler);
		},
		login: function (handler, opts) {
			var watchedHandler = function (event) {
				if(scope.$$phase) {
					handler(event);
				} else {
					scope.$apply(handler.defer([event]));
				}
			};

			FB.login(watchedHandler, opts);
		},
		logout: function (handler) {
			var watchedHandler = function (event) {
				if(scope.$$phase) {
					handler(event);
				} else {
					scope.$apply(handler.defer([event]));
				}
			};

			FB.logout(watchedHandler);
		}
	};
});

})();