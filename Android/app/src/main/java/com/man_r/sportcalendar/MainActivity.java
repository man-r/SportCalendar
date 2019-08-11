package com.man_r.sportcalendar;

import android.accounts.AccountManager;
import android.app.AlarmManager;
import android.app.Dialog;
import android.app.PendingIntent;
import android.app.TimePickerDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.os.StrictMode;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentActivity;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.TimePicker;
import android.widget.Toast;

import java.util.Calendar;


public class MainActivity extends FragmentActivity  {

    public static final String TAG = "manar";

    public static final String PREFS_NAME = "MyPrefsFile";
    public static final int GET_PERMISSION_REQUEST = 2;  // The request code
    public static final int REQUEST_CODE_EMAIL = 3;  // The request code

    //SampleAlarmReceiver alarm = new SampleAlarmReceiver();

    public static SharedPreferences settings;

    TextView intro;
    TextView time;
    TextView email;
    Button settime;
    Spinner spinner;
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
                        Log.d(TAG,"isNetworkAvailable");
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
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (Build.VERSION.SDK_INT > 8) {
            StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
            StrictMode.setThreadPolicy(policy);
        }
        Log.d(TAG,"onCreate");

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
                    Log.d(TAG,"onActivityResult");
                    settings = getSharedPreferences(PREFS_NAME, 0);
                    settings.registerOnSharedPreferenceChangeListener(mOnSharedPreferenceChange);

                    Log.d(TAG,"onActivityResult");
                    //Typeface font = Typeface.createFromAsset(getAssets(), "MCSBadrS_Unormal.ttf");
                    intro = (TextView) findViewById(R.id.intro);
                    time = (TextView) findViewById(R.id.time);
                    email = (TextView) findViewById(R.id.email);
                    settime = (Button) findViewById(R.id.settime);
                    spinner = (Spinner) findViewById(R.id.spinner1);
                    updatenow = (Button) findViewById(R.id.updatenow);
                    reminder = (CheckBox) findViewById(R.id.reminder);

                    ArrayAdapter<String> dataAdapter = new ArrayAdapter<String>(getApplicationContext(), android.R.layout.simple_spinner_item, Manar.getCalendars(getApplicationContext()));
                    dataAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                    spinner.setAdapter(dataAdapter);

                    spinner.setSelection(settings.getInt("calendarposition",1));
//                    intro.setTypeface(font);
//                    time.setTypeface(font);
//                    email.setTypeface(font);

                    settime.setOnClickListener(mOnClick);
                    updatenow.setOnClickListener(mOnClick);
                    reminder.setOnClickListener(mOnClick);

                    spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                        @Override
                        public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {

                            Object item = parent.getItemAtPosition(position);
                            if (item != null) {
                                Log.d(TAG, item.toString().substring(0,1));
                                int calendarid = Integer.parseInt(item.toString().substring(0,1));
                                SharedPreferences.Editor editor = settings.edit();
                                editor.putInt("calendarposition", position);
                                editor.putInt("calendarid", calendarid);

                                // Commit the edits!
                                editor.commit();
                            }

                        }

                        @Override
                        public void onNothingSelected(AdapterView<?> parent) {

                        }
                    });
                    setAlarm();
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
        } else if (requestCode == REQUEST_CODE_EMAIL && resultCode == RESULT_OK) {
            String accountName = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
            email.setText(accountName);
        }
    }

    private void setAlarm() {
        Log.d(TAG,"setAlarm");

        Calendar calendar = Calendar.getInstance();
        calendar.set(calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH),
            settings.getInt("hourofDay", 9),
            settings.getInt("minute", 0),
            0);

        //getting the alarm manager
        AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);

        //creating a new intent specifying the broadcast receiver
        Intent intent = new Intent(this, MyReceiver.class);

        //creating a pending intent using the intent
        PendingIntent pendingIntenti = PendingIntent.getBroadcast(this, 0, intent, 0);

        //setting the repeating alarm that will be fired every day
        if (android.os.Build.VERSION.SDK_INT >= 23) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,calendar.getTimeInMillis(),pendingIntenti);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP,calendar.getTimeInMillis(),pendingIntenti);
        }

        Toast.makeText(this, "Alarm is set", Toast.LENGTH_SHORT).show();
    }

    private void updateUI() {
        // Restore preferences

        time.setText(String.format("%02d", settings.getInt("hourofDay", 9)) + " : " +  String.format("%02d", settings.getInt("minute", 11)));
        reminder.setChecked(settings.getBoolean("reminder", true));


        setAlarm();
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
