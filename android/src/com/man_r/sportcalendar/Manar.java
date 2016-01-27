package com.man_r.sportcalendar;

import android.content.Context;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.DatabaseUtils;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.provider.CalendarContract.Events;

import android.util.Log;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.TimeZone;
public final class Manar {

	private Manar () {

  }

  public static boolean getMatches(Context act) {
		boolean found = false;
		StringBuilder a = new StringBuilder();

    ArrayList<String> lines = new ArrayList<String>();
    try {
      lines = Manar.getUrlSource("http://m.kooora.com");
    } catch (Exception e) {

    }

    for (int i = 0; i < lines.size(); i++) {
      //JSONObject jsonObject = new JSONObject();
      String inputLine = lines.get(i);
      if (inputLine.equals("\"\");")) {
        break;
      }
      //System.out.println(inputLine);
      String time = 	inputLine.substring(inputLine.indexOf("#") + 1, inputLine.indexOf("\","));

      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);
      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);
      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);
      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);

      String lege = inputLine.substring(inputLine.indexOf("\"") + 1, inputLine.indexOf("\","));

      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);
      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);
      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);

      String team1 = inputLine.substring(inputLine.indexOf("\"") + 1, inputLine.indexOf("\","));

      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);
      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);
      inputLine = inputLine.substring(inputLine.indexOf(",") + 1);

      String team2 = inputLine.substring(inputLine.indexOf("\"") + 1, inputLine.indexOf("\","));

      //a.append(inputLine);
      Log.d("SC", "event = " + team1 + " vs. " + team2);
      Log.d("SC", "notes = " + lege);
      Log.d("SC", "timestamp = " + time + "(" + new Date(Long.parseLong(time)*1000) + ")");
      Log.d("SC", "");
      Log.d("SC", "");

      String title = team1 + " vs. " + team2;
      long startTime = Long.parseLong(time)*1000;
      long endTime = Long.parseLong(time)*1000 + 105*60000;
      String description = lege;
      String location = "";
      Long firstReminderMinutes = new Long(60);
      Long secondReminderMinutes = new Long(30);

      //addEvent(team1 + " vs. " + team2, lege, Long.parseLong(time)*1000);
      found = addEvent(act, Events.CONTENT_URI, title, startTime, endTime, description, location, firstReminderMinutes, secondReminderMinutes);
    }

		return found;
  }

  public static ArrayList<String> getUrlSource(String url) throws IOException {
    URL mURL = new URL(url);
    URLConnection mURLConnection = mURL.openConnection();

    BufferedReader in = new BufferedReader(new InputStreamReader(mURLConnection.getInputStream(), "cp1256"));
    String inputLine;

    ArrayList<String> lines = new ArrayList<String>();

    boolean start = false;
    while ((inputLine = in.readLine()) != null) {
      if (inputLine.contains("var video_list")) {
        break;
      }
      if (start) {
        lines.add(inputLine);
      }

      if (inputLine.contains("match_box")) {
        start  = true;
      }

    }
    in.close();

    return lines;
  }

  public static boolean addEvent(Context act, Uri eventsUri, String title, long startTime, long endTime, String description, String location, Long firstReminderMinutes, Long secondReminderMinutes) {
    if (!eventAvailable(act, eventsUri, title, startTime, endTime, description, location, firstReminderMinutes, secondReminderMinutes)) {
			createEvent(act, eventsUri, title, startTime, endTime, description, location, firstReminderMinutes, secondReminderMinutes);
    }
    return true;
  }

  public static boolean eventAvailable(Context act, Uri eventsUri, String title, long startTime, long endTime, String description, String location, Long firstReminderMinutes, Long secondReminderMinutes) {
    Log.d("Calendar", "eventAvailable:" + startTime + " - " + endTime);
		String[] projection = {
        Events.TITLE,
				Events.DESCRIPTION,
				Events.DTSTART,
				Events.DTEND
    };

    // Run query
    Cursor cur = null;
    ContentResolver cr = act.getContentResolver();
    String selection = "((" + Events.TITLE + " = ?) AND (" + Events.DESCRIPTION + " = ?))";

    String[] selectionArgs = new String[] {title, description};

    // Submit the query and get a Cursor object back.
    cur = cr.query(eventsUri, null, selection, selectionArgs, null);

		Log.d("Calendar", DatabaseUtils.dumpCursorToString(cur));

    while (cur.moveToNext()) {
			if (cur.getString(cur.getColumnIndex("title")).equals(title) &&
					cur.getString(cur.getColumnIndex("description")).equals(description) &&
					cur.getLong(cur.getColumnIndex("dtstart")) == startTime &&
					cur.getLong(cur.getColumnIndex("dtend")) == endTime) {

						Log.d("Calendar", "found");
				return true;
			}

    }
    return false;
  }

  public static boolean createEvent(Context act, Uri eventsUri, String title, long startTime, long endTime, String description,
                             String location, Long firstReminderMinutes, Long secondReminderMinutes) {
    try {
      ContentResolver cr = act.getContentResolver();
      ContentValues values = new ContentValues();
      final boolean allDayEvent = false;
      values.put(Events.EVENT_TIMEZONE, TimeZone.getDefault().getID());
      values.put(Events.ALL_DAY, allDayEvent ? 1 : 0);
      values.put(Events.DTSTART, allDayEvent ? startTime+(1000*60*60*24) : startTime);
      values.put(Events.DTEND, endTime);
      values.put(Events.TITLE, title);
      values.put(Events.DESCRIPTION, description);
      values.put(Events.HAS_ALARM, 1);
      values.put(Events.CALENDAR_ID, 1);
      values.put(Events.EVENT_LOCATION, location);
      Uri uri = cr.insert(eventsUri, values);

    } catch (Exception e) {
      Log.e("Calendar", e.getMessage(), e);
      return false;
    }

    return true;
  }

	public static boolean isNetworkAvailable(Context context) {
		ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
		NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
		return activeNetworkInfo != null && activeNetworkInfo.isConnected();
}
}
