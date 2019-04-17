package com.man_r.sportcalendar;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.util.Log;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;
import android.Manifest;


import android.util.Log;
public class GetPermission extends Activity  implements ActivityCompat.OnRequestPermissionsResultCallback {

    public static final String TAG = "manar";
    private static final int REQUEST_READ_CALENDAR = 0;
    private static final int REQUEST_WRITE_CALENDAR = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d(TAG,"onCreate");
        super.onCreate(savedInstanceState);

        getPermissions();


    }

    void getPermissions(){

        //getREAD_CALENDARPermission
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_CALENDAR) != PackageManager.PERMISSION_GRANTED) {

            // Should we show an explanation?
            if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.READ_CALENDAR)) {

                // Show an expanation to the user *asynchronously* -- don't block
                // this thread waiting for the user's response! After the user
                // sees the explanation, try again to request the permission.
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_CALENDAR}, REQUEST_READ_CALENDAR);

            } else {

                // No explanation needed, we can request the permission.

                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_CALENDAR},REQUEST_READ_CALENDAR);

                // MY_PERMISSIONS_REQUEST_READ_CONTACTS is an
                // app-defined int constant. The callback method gets the
                // result of the request.
            }
        }

        //get WRITE_CALENDAR permission
        else if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_CALENDAR) != PackageManager.PERMISSION_GRANTED) {

            // Should we show an explanation?
            if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.WRITE_CALENDAR)) {

                // Show an expanation to the user *asynchronously* -- don't block
                // this thread waiting for the user's response! After the user
                // sees the explanation, try again to request the permission.
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_CALENDAR}, REQUEST_WRITE_CALENDAR);

            } else {

                // No explanation needed, we can request the permission.

                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_CALENDAR}, REQUEST_WRITE_CALENDAR);

                // MY_PERMISSIONS_REQUEST_READ_CONTACTS is an
                // app-defined int constant. The callback method gets the
                // result of the request.
            }
        }


        else {
            Intent returnIntent = new Intent();
            returnIntent.putExtra("json", "all permission granted");
            setResult(RESULT_OK,returnIntent);
            finish();
        }

    }
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        Log.d(TAG,"onRequestPermissionsResult");
        if (requestCode == REQUEST_READ_CALENDAR) {
            // BEGIN_INCLUDE(permission_result)
            // Received permission result for READ_CALENDAR permission.
            Log.i(TAG, "Received response for READ_CALENDAR permission request.");

            // Check if the only required permission has been granted
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // READ_CALENDAR permission has been granted, preview can be displayed
                Log.i(TAG, "READ_CALENDAR permission has now been granted. Showing preview.");
                getPermissions();

            } else {
                Log.i(TAG, "READ_CALENDAR permission was NOT granted.");
                Intent returnIntent = new Intent();
                returnIntent.putExtra("json", "READ_CALENDAR permission not granted");
                setResult(RESULT_OK,returnIntent);
                finish();

            }
            // END_INCLUDE(permission_result)

        }

        if (requestCode == REQUEST_WRITE_CALENDAR) {
            // BEGIN_INCLUDE(permission_result)
            // Received permission result for READ_CALENDAR permission.
            Log.i(TAG, "Received response for WRITE_CALENDAR permission request.");

            // Check if the only required permission has been granted
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // READ_CALENDAR permission has been granted, preview can be displayed
                Log.i(TAG, "WRITE_CALENDAR permission has now been granted. Showing preview.");
                getPermissions();

            } else {
                Log.i(TAG, "WRITE_CALENDAR permission was NOT granted.");
                Intent returnIntent = new Intent();
                returnIntent.putExtra("json", "WRITE_CALENDAR permission not granted");
                setResult(RESULT_OK,returnIntent);
                finish();

            }
            // END_INCLUDE(permission_result)

        }
    }
}
