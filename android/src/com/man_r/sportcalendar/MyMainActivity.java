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

      StringBuilder a = new StringBuilder();

      ArrayList<String> lines = new ArrayList<String>();
      try {
        lines = getUrlSource("http://m.kooora.com");
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
        long endTime = Long.parseLong(time)*1000;
        String description = lege;
        String location = "";
        Long firstReminderMinutes = new Long(60);
        Long secondReminderMinutes = new Long(30);

        //addEvent(team1 + " vs. " + team2, lege, Long.parseLong(time)*1000);
        createEvent(Events.CONTENT_URI, title, startTime, endTime, description, location, firstReminderMinutes, secondReminderMinutes);
      }
  }

  private void addEvent(String event, String notes, long startTime) {
    long calId = 1;

    ContentValues values = new ContentValues();
    values.put(Events.DTSTART, startTime);
    values.put(Events.DTEND, startTime + 105*60000);
    values.put(Events.TITLE, event);
    //values.put(Events.EVENT_LOCATION, "Münster");
    values.put(Events.CALENDAR_ID, calId);
    values.put(Events.DESCRIPTION,notes);

    // reasonable defaults exist:
    values.put(Events.ACCESS_LEVEL, Events.ACCESS_PRIVATE);
    values.put(Events.SELF_ATTENDEE_STATUS, Events.STATUS_CONFIRMED);
    values.put(Events.AVAILABILITY, Events.AVAILABILITY_BUSY);

    Uri uri = getContentResolver().insert(Events.CONTENT_URI, values);
    //long eventId = new Long(uri.getLastPathSegment());
  }
  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
      getMenuInflater().inflate(R.menu.main, menu);
      return true;
  }

  public boolean createEvent(Uri eventsUri, String title, long startTime, long endTime, String description,
                             String location, Long firstReminderMinutes, Long secondReminderMinutes) {
    try {
      ContentResolver cr = getContentResolver();
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

      // TODO ?
      //getActiveCalendarIds();

      // if (firstReminderMinutes != null) {
      //   ContentValues reminderValues = new ContentValues();
      //   reminderValues.put("event_id", Long.parseLong(uri.getLastPathSegment()));
      //   reminderValues.put("minutes", firstReminderMinutes);
      //   reminderValues.put("method", 1);
      //   cr.insert(Uri.parse(CONTENT_PROVIDER + CONTENT_PROVIDER_PATH_REMINDERS), reminderValues);
      // }
      //
      // if (secondReminderMinutes != null) {
      //   ContentValues reminderValues = new ContentValues();
      //   reminderValues.put("event_id", Long.parseLong(uri.getLastPathSegment()));
      //   reminderValues.put("minutes", secondReminderMinutes);
      //   reminderValues.put("method", 1);
      //   cr.insert(Uri.parse(CONTENT_PROVIDER + CONTENT_PROVIDER_PATH_REMINDERS), reminderValues);
      // }
    } catch (Exception e) {
      Log.e("Calendar", e.getMessage(), e);
      return false;
    }

    return true;
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

  private static ArrayList<String> getUrlSource(String url) throws IOException {
    URL mURL = new URL(url);
    URLConnection mURLConnection = mURL.openConnection();

    BufferedReader in = new BufferedReader(new InputStreamReader(mURLConnection.getInputStream(), "UTF-8"));
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
}
