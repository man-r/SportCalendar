package com.man_r.sportcalendar;

import android.app.Activity;
import android.os.Bundle;
import android.widget.TextView;

import java.util.*;
import java.io.*;
import java.net.*;

public class MyMainActivity extends Activity
{
    TextView textView;
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        textView = new TextView(this);
        textView.setText("hello!");
        try {
          textView.setText(fromURL("http://m.kooora.com").toString());
        } catch (Exception e) {
          textView.setText(e.toString());
        }

        setContentView(textView);
    }

    static ArrayList<String> fromURL(String surl) {
      URL url;
      InputStream is = null;
      BufferedReader br;
      String line;
      ArrayList<String> lines = new ArrayList<String>();

      try {
        url = new URL(surl);
        is = url.openStream();  // throws an IOException
        br = new BufferedReader(new InputStreamReader(is));

        while ((line = br.readLine()) != null) {
          if (lines.size() > 0 || line.contains("match_box")) {
            lines.add(line);
          }
        }
      } catch (MalformedURLException mue) {
        mue.printStackTrace();
      } catch (IOException ioe) {
        ioe.printStackTrace();
      } finally {
        try {
          if (is != null) is.close();
        } catch (IOException ioe) {
            // nothing to see here
        }
      }

      return lines;
    }

    static ArrayList<String> getUrlSource(String url) throws IOException {
      URL mURL = new URL(url);
      URLConnection mURLConnection = mURL.openConnection();

      BufferedReader in = new BufferedReader(new InputStreamReader(mURLConnection.getInputStream(), "UTF-8"));
      String inputLine;

      StringBuilder a = new StringBuilder();
      ArrayList<String> lines = new ArrayList<String>();
      while ((inputLine = in.readLine()) != null) {
        a.append(inputLine);
        if (lines.size() > 0 || inputLine.contains("match_box")) {
          lines.add(inputLine);
          System.out.println(inputLine);
        }

        if (inputLine.contains("var video_list")) {
          break;
        }
      }


      in.close();


      return lines;
    }
}
