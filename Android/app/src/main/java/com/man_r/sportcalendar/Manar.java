package com.man_r.sportcalendar;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.CalendarContract;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.TimeZone;

public final class Manar {

    public static final String TAG = "manar";
    public static final String PREFS_NAME = "MyPrefsFile";
    public static SharedPreferences settings;

    private Manar () {

    }

    public static boolean getMatches(Context act) {
        Log.d(TAG,"getMatches");
        createNotifiation(act, "manar","Updating calendar");
        settings = act.getSharedPreferences(PREFS_NAME, 0);

        boolean found = false;
        StringBuilder a = new StringBuilder();

        ArrayList<String> lines = new ArrayList<String>();
        try {
            //getCalID(act);
            Log.d("manar", "before");
            lines = Manar.getUrlSource("https://m.kooora.com");
            Log.d("manar", lines.toString());
        } catch (Exception e) {
            Log.e(TAG, "Exception", e);
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

            String title = team1 + " vs. " + team2;
            long startTime = Long.parseLong(time)*1000;
            long endTime = Long.parseLong(time)*1000 + 105*60000;
            String description = lege;
            String location = "";
            Long firstReminderMinutes = new Long(60);
            Long secondReminderMinutes = new Long(30);

            //addEvent(team1 + " vs. " + team2, lege, Long.parseLong(time)*1000);
            found = addEvent(act, CalendarContract.Events.CONTENT_URI, title, startTime, endTime, description, location, firstReminderMinutes, secondReminderMinutes);
        }

        updateNotifiation(act, "manar");
        return found;
    }

    public static void getCalID(Context act) {
        Uri calUri = CalendarContract.Calendars.CONTENT_URI.buildUpon().build();


        Cursor cur = act.getContentResolver().query(calUri, null, null, null, null);
        Log.d("manar", "getCalID");
        //Log.d("manar", DatabaseUtils.dumpCursorToString(cur));

        cur.moveToFirst();
        for (int i = 0; i < cur.getCount(); i++) {
            for (int j = 0; j < cur.getColumnCount(); j++) {
                if (!cur.getString(6).equals("0")) {
                    Log.d("manar", i + " - " + cur.getColumnName(j) + ": " + cur.getString(j));
                }

            }
            cur.moveToNext();
        }

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
        } else {
            Log.d(TAG, "Event Available");
        }
        return true;
    }

    public static boolean eventAvailable(Context act, Uri eventsUri, String title, long startTime, long endTime, String description, String location, Long firstReminderMinutes, Long secondReminderMinutes) {
        ////Log.d("manar", "eventAvailable:" + startTime + " - " + endTime);
        String[] projection = {
                CalendarContract.Events.TITLE,
                CalendarContract.Events.DESCRIPTION,
                CalendarContract.Events.DTSTART,
                CalendarContract.Events.DTEND,
                CalendarContract.Events.CALENDAR_ID,
        };

        // Run query
        Cursor cur = null;
        ContentResolver cr = act.getContentResolver();
        String selection = "((" + CalendarContract.Events.TITLE + " = ?) AND (" + CalendarContract.Events.DESCRIPTION + " = ?))";

        String[] selectionArgs = new String[] {title, description};

        // Submit the query and get a Cursor object back.
        cur = cr.query(eventsUri, null, selection, selectionArgs, null);
        //Log.d("manar", "DatabaseUtils.dumpCursorToString(cur)");
        //Log.d("manar", DatabaseUtils.dumpCursorToString(cur));

        while (cur.moveToNext()) {
            //Log.d("manar", cur.getColumnIndex("calendar_id")+ "calendar_id");
            if (cur.getString(cur.getColumnIndex("title")).equals(title) &&
                    cur.getString(cur.getColumnIndex("description")).equals(description) &&
                    cur.getLong(cur.getColumnIndex("dtstart")) == startTime &&
                    cur.getLong(cur.getColumnIndex("dtend")) == endTime &&
                    cur.getLong(cur.getColumnIndex("CALENDAR_ID")) == settings.getInt("calendarid",1)) {

                //Log.d("manar", "found");
                return true;
            }

        }
        return false;
    }

    public static boolean createEvent(Context act, Uri eventsUri, String title, long startTime, long endTime, String description,
                                      String location, Long firstReminderMinutes, Long secondReminderMinutes) {
        //Log.d("manar" , "createEvent");
        try {
            ContentResolver cr = act.getContentResolver();
            ContentValues values = new ContentValues();
            final boolean allDayEvent = false;
            values.put(CalendarContract.Events.EVENT_TIMEZONE, TimeZone.getDefault().getID());
            values.put(CalendarContract.Events.ALL_DAY, allDayEvent ? 1 : 0);
            values.put(CalendarContract.Events.DTSTART, allDayEvent ? startTime+(1000*60*60*24) : startTime);
            values.put(CalendarContract.Events.DTEND, endTime);
            values.put(CalendarContract.Events.TITLE, title);
            values.put(CalendarContract.Events.DESCRIPTION, description);
            values.put(CalendarContract.Events.HAS_ALARM, 1);
            values.put(CalendarContract.Events.CALENDAR_ID, settings.getInt("calendarid",1));
            values.put(CalendarContract.Events.EVENT_LOCATION, location);
            Uri uri = cr.insert(eventsUri, values);
            Log.d(TAG, uri.getPath());

            // get the event ID that is the last element in the Uri
            long eventID = Long.parseLong(uri.getLastPathSegment());

            // add 60 minute reminder for the event
            if (settings.getBoolean("reminder", true)) {
                ContentValues reminders = new ContentValues();
                reminders.put(CalendarContract.Reminders.EVENT_ID, eventID);
                reminders.put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT);
                reminders.put(CalendarContract.Reminders.MINUTES, 60); //user pref
//Log.d("manar" , "createEvent");
                cr.insert(CalendarContract.Reminders.CONTENT_URI, reminders);
                //Log.d("manar" , "createEvent");
            }

        } catch (Exception e) {
            Log.e("manar", e.getMessage(), e);
            return false;
        }

        return true;
    }

    public static void createNotifiation(Context context, String CHANNEL_ID, String contentText) {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Sport Calendar";
            String description = "Sport Calendar Notification";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel("manar", name, importance);
            channel.setDescription(description);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }

        // Create an explicit intent for an Activity in your app
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);


        NotificationCompat.Builder builder = new NotificationCompat.Builder(context,CHANNEL_ID)
                .setSmallIcon(R.drawable.icon)
                .setContentTitle("Sport Calendar")
                .setContentText(contentText)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

        // notificationId is a unique int for each notification that you must define
        notificationManager.notify(7, builder.build());

    }

    public static void updateNotifiation(Context context, String CHANNEL_ID) {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        // Create an explicit intent for an Activity in your app
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);


        NotificationCompat.Builder builder = new NotificationCompat.Builder(context,CHANNEL_ID)
                .setSmallIcon(R.drawable.icon)
                .setContentTitle("Sport Calendar")
                .setContentText("Calendar updated")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

        // notificationId is a unique int for each notification that you must define
        notificationManager.notify(7, builder.build());

    }

    public static boolean isNetworkAvailable(Context context) {
        Log.d("manar", "isNetworkAvailable");
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetworkInfo = connectivityManager.getActiveNetworkInfo();
        return activeNetworkInfo != null && activeNetworkInfo.isConnected();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////

    public static List<String> getCalendars(Context ctx) {

        List<String> result = new ArrayList();

        final String[] EVENT_PROJECTION = new String[]{
                CalendarContract.Calendars._ID,
                CalendarContract.Calendars.NAME,
                CalendarContract.Calendars.CALENDAR_DISPLAY_NAME
        };

        final ContentResolver cr = ctx.getContentResolver();
        final Uri uri = CalendarContract.Calendars.CONTENT_URI;
        Cursor cur = cr.query(uri, EVENT_PROJECTION, null, null, null);

        while (cur.moveToNext()) {
            String item = cur.getString(cur.getColumnIndex(CalendarContract.Calendars._ID)) + " - " + cur.getString(cur.getColumnIndex(CalendarContract.Calendars.CALENDAR_DISPLAY_NAME));
            result.add(item);
        }
        cur.close();
        return result;
    }
}
