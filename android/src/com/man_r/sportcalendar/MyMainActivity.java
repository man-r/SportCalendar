package com.man_r.sportcalendar;

import android.widget.TextView;
import android.app.Dialog;
import android.app.TimePickerDialog;
import android.app.TimePickerDialog.OnTimeSetListener;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentActivity;
import android.widget.TimePicker;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.provider.CalendarContract.Events;
import android.text.format.DateFormat;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.Toast;

import android.util.Log;

import java.util.*;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.net.URL;
import java.net.URLConnection;

public class MyMainActivity extends FragmentActivity {
    public static final String TAG = "manar";

    public static final String PREFS_NAME = "MyPrefsFile";
    public static final int GET_PERMISSION_REQUEST = 2;  // The request code

    SampleAlarmReceiver alarm = new SampleAlarmReceiver();

    public static SharedPreferences settings;

    TextView intro;
    TextView time;
    Button settime;
    Button updatenow;
    CheckBox reminder;

    View.OnClickListener mOnClick = new View.OnClickListener() {
        @Override
		public void onClick(View v){
            switch (v.getId()) {
                case R.id.settime:
                    DialogFragment newFragment = new TimePickerFragment();
                    newFragment.show(getSupportFragmentManager(), "timePicker");
                    break;

                case R.id.reminder:
                    SharedPreferences.Editor editor = settings.edit();
                    editor.putBoolean("reminder", reminder.isChecked());
                    // Commit the edits!
                    editor.commit();
                    break;

                case R.id.updatenow:
                    if(Manar.isNetworkAvailable(getApplicationContext())) {
                        Manar.getMatches(getApplicationContext());
                    }
            }
        }
    };

    SharedPreferences.OnSharedPreferenceChangeListener mOnSharedPreferenceChange = new SharedPreferences.OnSharedPreferenceChangeListener() {
        @Override
        public void onSharedPreferenceChanged (SharedPreferences sharedPreferences, String key) {
            updateUI();
        }
    };
  
    @Override
    protected void onCreate(Bundle savedInstanceState) {
      Log.d(TAG,"onActivityResult");
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);

        Context context = getApplicationContext();
        Intent intent = new Intent(context, GetPermission.class);
        startActivityForResult(intent, GET_PERMISSION_REQUEST);
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data){
        Log.d(TAG,"onActivityResult");
        if (requestCode == GET_PERMISSION_REQUEST) {
            if(resultCode == RESULT_OK){
                String result=data.getStringExtra("json");
                Log.d(TAG, "result " + result);

                if (result.equals("all permission granted")) {
                    settings = getSharedPreferences(PREFS_NAME, 0);
                    settings.registerOnSharedPreferenceChangeListener(mOnSharedPreferenceChange);

                    Typeface font = Typeface.createFromAsset(getAssets(), "MCSBadrS_Unormal.ttf");
                    intro = (TextView) findViewById(R.id.intro);
                    time = (TextView) findViewById(R.id.time);
                    settime = (Button) findViewById(R.id.settime);
                    updatenow = (Button) findViewById(R.id.updatenow);
                    reminder = (CheckBox) findViewById(R.id.reminder);

                    intro.setTypeface(font);
                    time.setTypeface(font);

                    settime.setOnClickListener(mOnClick);
                    updatenow.setOnClickListener(mOnClick);
                    reminder.setOnClickListener(mOnClick);

                    updateUI();
                  
                } else {
                    Log.d(TAG, "RESULT_OK " + RESULT_OK);
                    Log.d(TAG, "RESULT_CANCELED " + RESULT_CANCELED);
                    Log.d(TAG, "resultCode " + resultCode);
                    finish();
                }
    
                if (resultCode == RESULT_CANCELED) {
                    finish();
                }
            }
        }
    }

  private void updateUI() {
    // Restore preferences

    time.setText(String.format("%02d", settings.getInt("hourofDay", 9)) + " : " +  String.format("%02d", settings.getInt("minute", 11)));
    reminder.setChecked(settings.getBoolean("reminder", true));

    alarm.setAlarm(this);
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


  public static class TimePickerFragment extends DialogFragment implements TimePickerDialog.OnTimeSetListener {
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
      int hour = settings.getInt("hourofDay", 9);
      int minute = settings.getInt("minute", 11);

      // Create a new instance of TimePickerDialog and return it
      return new TimePickerDialog(getActivity(), this, hour, minute, DateFormat.is24HourFormat(getActivity()));
    }

    public void onTimeSet(TimePicker view, int hourofDay, int minute) {
      // Do something with the time chosen by the user
      SharedPreferences.Editor editor = settings.edit();
      editor.putInt("hourofDay", hourofDay);
      editor.putInt("minute", minute);

      // Commit the edits!
      editor.commit();
    }
  }
}
