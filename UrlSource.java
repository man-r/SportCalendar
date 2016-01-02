import java.util.*;
import java.io.*;
import java.net.*;

class UrlSource {

  public static void main(String[] args) {
    try {
      getUrlSource("http://m.kooora.com");
    } catch (Exception e) {

    }

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
