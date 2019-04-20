package com.man_r.sportcalendar;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.widget.Toast;

import java.util.Calendar;

public class MyReceiver extends BroadcastReceiver {
    public static final String TAG = "manar";
    public static final String PREFS_NAME = "MyPrefsFile";
    public static SharedPreferences settings;
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG,"onReceive");
        settings = context.getSharedPreferences(PREFS_NAME, 0);
        Calendar calendar = Calendar.getInstance();
        if (android.os.Build.VERSION.SDK_INT >= 23) {
            calendar.set(calendar.get(Calendar.YEAR),
                    calendar.get(Calendar.MONTH),
                    calendar.get(Calendar.DAY_OF_MONTH),
                    settings.getInt("hourofDay", 9),
                    settings.getInt("minute", 0),
                    0);
        } else {
            calendar.set(calendar.get(Calendar.YEAR), calendar.get(
                    Calendar.MONTH),
                    calendar.get(Calendar.DAY_OF_MONTH),
                    settings.getInt("hourofDay", 9),
                    settings.getInt("minute", 0),
                    0);
        }
        Log.d(TAG,"calendar");
        // an Intent broadcast.
        if(Manar.isNetworkAvailable(context)) {
            Log.d(TAG,"MyReciever isNetworkAvailable");
            Manar.getMatches(context);
        }
    }
}
