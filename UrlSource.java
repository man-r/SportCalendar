import java.util.*;
import java.io.*;
import java.net.*;

//import org.json.JSONObject;

class UrlSource {

  public static void main(String[] args) {
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
      System.out.println(inputLine);
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

      System.out.println("event = " + team1 + " vs. " + team2);
      System.out.println("notes = " + lege);
      System.out.println("timestamp = " + time + "(" + new Date(Long.parseLong(time)*1000) + ")");
      System.out.println();
      System.out.println();
    }

  }

  static ArrayList<String> getUrlSource(String url) throws IOException {
    URL mURL = new URL(url);
    URLConnection mURLConnection = mURL.openConnection();

    BufferedReader in = new BufferedReader(new InputStreamReader(mURLConnection.getInputStream(), "cp1256"));
    String inputLine;

    StringBuilder a = new StringBuilder();
    ArrayList<String> lines = new ArrayList<String>();

    boolean start = false;
    while ((inputLine = in.readLine()) != null) {
      //a.append(inputLine);
      if (inputLine.contains("var video_list")) {
        break;
      }
      if (start) {
        start = true;
        lines.add(inputLine);
        System.out.println(inputLine);
      }

      if (inputLine.contains("match_box")) {
        start  = true;
      }

    }
    in.close();

    return lines;
  }
}
