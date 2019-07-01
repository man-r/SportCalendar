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
        Manar.createNotifiation(context, "manar", "onRecieve");
        // an Intent broadcast.
        if(Manar.isNetworkAvailable(context)) {
            Log.d(TAG,"MyReciever isNetworkAvailable");

            Manar.createNotifiation(context, "manar", "MyReciever isNetworkAvailable");
            Manar.getMatches(context);
        }
    }
}
