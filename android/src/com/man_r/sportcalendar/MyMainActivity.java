package com.man_r.sportcalendar;

import android.widget.TextView;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Bundle;
import android.provider.CalendarContract.Events;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import android.util.Log;

import java.util.*;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.net.URL;
import java.net.URLConnection;

public class MyMainActivity extends Activity {
  SampleAlarmReceiver alarm = new SampleAlarmReceiver();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setContentView(R.layout.activity_main);
      alarm.setAlarm(this);
      Manar.getMatches(this);
      Toast.makeText(getApplicationContext(), "alarm started!", Toast.LENGTH_SHORT).show();
  }

  // Menu options to set and cancel the alarm.
  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
      switch (item.getItemId()) {
          // When the user clicks START ALARM, set the alarm.
          case R.id.start_action:
              alarm.setAlarm(this);
              return true;
          // When the user clicks CANCEL ALARM, cancel the alarm.
          case R.id.cancel_action:
              alarm.cancelAlarm(this);
              return true;
      }
      return false;
  }
}
