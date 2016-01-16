package com.man_r.sportcalendar;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

public class MyMainActivity extends Activity
{
  SampleAlarmReceiver alarm = new SampleAlarmReceiver();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
      setContentView(R.layout.activity_main);
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
}
