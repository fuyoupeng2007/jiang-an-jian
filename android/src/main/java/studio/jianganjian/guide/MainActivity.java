package studio.jianganjian.guide;
import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.*;
import java.io.*;
public class MainActivity extends Activity {
 private static final String ORIGIN="https://appassets.androidplatform.net";
 private static final String ROOT=ORIGIN+"/";
 private WebView browser;
 private GpsBridge gps;
 @Override public void onCreate(Bundle saved){
  super.onCreate(saved);
  browser=new WebView(this);
  setContentView(browser);
  WebSettings settings=browser.getSettings();
  settings.setJavaScriptEnabled(true);
  settings.setDomStorageEnabled(true);
  settings.setGeolocationEnabled(true);
  settings.setAllowFileAccess(false);
  settings.setAllowContentAccess(false);
  gps=new GpsBridge(this,browser);browser.addJavascriptInterface(gps,"GuideGps");
  browser.setWebChromeClient(new WebChromeClient());
  browser.setWebViewClient(new WebViewClient(){
   @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
    Uri uri=request.getUrl();
    if(!uri.toString().startsWith(ROOT))return empty();
    String file=uri.getPath();
    if(file==null||file.length()<2)return empty();
    file=file.substring(1);
    if(!file.matches("[a-zA-Z0-9_./-]+")||file.contains(".."))return empty();
    String mime=file.endsWith(".html")?"text/html":file.endsWith(".css")?"text/css":file.endsWith(".js")?"application/javascript":file.endsWith(".webp")?"image/webp":file.endsWith(".png")?"image/png":file.endsWith(".woff2")?"font/woff2":file.endsWith(".txt")?"text/plain":"application/json";
    try{return new WebResourceResponse(mime,mime.startsWith("image/")||mime.startsWith("font/")?null:"UTF-8",getAssets().open(file));}catch(IOException exception){return empty();}
   }
   private WebResourceResponse empty(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",null,new ByteArrayInputStream(new byte[0]));}
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
    Uri uri=request.getUrl();
    if(uri.toString().startsWith(ROOT))return false;
    if(request.isForMainFrame()&&("https".equals(uri.getScheme())||"http".equals(uri.getScheme()))){
     try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(android.content.ActivityNotFoundException ignored){}
    }
    return true;
   }
  });
  if(saved==null||browser.restoreState(saved)==null)browser.loadUrl(ROOT+"index.html");
 }
 @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] results){
  super.onRequestPermissionsResult(request,permissions,results);if(request==17)gps.permissionResult();
 }
 @Override protected void onStop(){super.onStop();gps.background();}
 @Override protected void onDestroy(){gps.clear();browser.removeJavascriptInterface("GuideGps");super.onDestroy();}
 @Override protected void onSaveInstanceState(Bundle state){super.onSaveInstanceState(state);browser.saveState(state);}
 @Override protected void onPause(){super.onPause();browser.onPause();}
 @Override protected void onResume(){super.onResume();if(gps!=null)gps.foreground();browser.onResume();}
 @Override public void onBackPressed(){
  browser.evaluateJavascript("(function(){var d=document.querySelector('dialog[open]');if(d){d.close();return true}var f=document.getElementById('endFollow');if(f&&document.body.classList.contains('following')){f.click();return true}var p=document.getElementById('pick');if(p&&!p.hidden){p.hidden=true;return true}return false})()",value->{if(!"true".equals(value)){if(browser.canGoBack())browser.goBack();else finish();}});
 }
}

