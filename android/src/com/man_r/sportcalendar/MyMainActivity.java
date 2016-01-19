package com.man_r.sportcalendar;

import android.widget.TextView;

import android.app.Activity;
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

        addEvent(team1 + " vs. " + team2, lege, Long.parseLong(time)*1000);
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
