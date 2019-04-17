package com.man_r.sportcalendar;

import android.accounts.AccountManager;
import android.app.Dialog;
import android.app.TimePickerDialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.os.StrictMode;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentActivity;
import android.text.format.DateFormat;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.TimePicker;


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
    Button setemail;
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

                case R.id.setemail:
//                    Intent intent = AccountPicker.newChooseAccountIntent(null, null,new String[] { GoogleAuthUtil.GOOGLE_ACCOUNT_TYPE }, false, null, null, null, null);
//                    startActivityForResult(intent, REQUEST_CODE_EMAIL);
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
                    setemail = (Button) findViewById(R.id.setemail);
                    updatenow = (Button) findViewById(R.id.updatenow);
                    reminder = (CheckBox) findViewById(R.id.reminder);

//                    intro.setTypeface(font);
//                    time.setTypeface(font);
//                    email.setTypeface(font);

                    settime.setOnClickListener(mOnClick);
                    setemail.setOnClickListener(mOnClick);
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
        } else if (requestCode == REQUEST_CODE_EMAIL && resultCode == RESULT_OK) {
            String accountName = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
            email.setText(accountName);
        }
    }

    private void updateUI() {
        // Restore preferences

        time.setText(String.format("%02d", settings.getInt("hourofDay", 9)) + " : " +  String.format("%02d", settings.getInt("minute", 11)));
        reminder.setChecked(settings.getBoolean("reminder", true));

        //alarm.setAlarm(this);
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
