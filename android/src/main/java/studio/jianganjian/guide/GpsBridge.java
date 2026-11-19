package studio.jianganjian.guide;

import android.app.Activity;
import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import org.json.JSONObject;

final class GpsBridge implements LocationListener {
 private final Activity activity;
 private final WebView browser;
 private final LocationManager service;
 private final LinkedHashMap<String,Boolean> jobs=new LinkedHashMap<>();
 private boolean prompted=false, listening=false, active=true;
 GpsBridge(Activity owner, WebView view){
  activity=owner;browser=view;service=(LocationManager)owner.getSystemService(Context.LOCATION_SERVICE);
 }
 private boolean local(){
  String url=browser.getUrl();return url!=null&&url.startsWith("https://appassets.androidplatform.net/");
 }
 private boolean granted(){
  return activity.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED||activity.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED;
 }
 @JavascriptInterface public void request(String key,boolean continuous){
  if(key==null||!key.matches("gps[0-9a-z_]{1,42}"))return;
  activity.runOnUiThread(()->{
   if(!local())return;
   if(!active){deliver(key,"null",4);return;}
   jobs.put(key,continuous);
   if(granted()){subscribe();return;}
   if(!prompted){prompted=true;activity.requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},17);}
  });
 }
 @JavascriptInterface public void cancel(String key){activity.runOnUiThread(()->{jobs.remove(key);if(jobs.isEmpty())stopProvider();});}
 void permissionResult(){prompted=false;if(granted())subscribe();else fail(1);}
 private void subscribe(){
  if(jobs.isEmpty()||!local())return;
  if(!listening){
   boolean enabled=false;
   for(String provider:new String[]{LocationManager.GPS_PROVIDER,LocationManager.NETWORK_PROVIDER}){
    try{if(service.isProviderEnabled(provider)){service.requestLocationUpdates(provider,1200,1,this,Looper.getMainLooper());enabled=true;}}
    catch(IllegalArgumentException|SecurityException ignored){}
   }
   listening=enabled;if(!enabled){fail(2);return;}
  }
  Location best=null;
  for(String provider:new String[]{LocationManager.GPS_PROVIDER,LocationManager.NETWORK_PROVIDER}){
   try{Location last=service.getLastKnownLocation(provider);
    if(last!=null&&Math.abs(System.currentTimeMillis()-last.getTime())<8000&&(best==null||last.getAccuracy()<best.getAccuracy()))best=last;
   }catch(IllegalArgumentException|SecurityException ignored){}
  }
  if(best!=null)onLocationChanged(best);
 }
 @Override public void onLocationChanged(Location location){
  if(!local()){clear();return;}
  String payload;
  try{
   JSONObject coords=new JSONObject();
   coords.put("latitude",location.getLatitude());coords.put("longitude",location.getLongitude());coords.put("accuracy",location.hasAccuracy()?location.getAccuracy():100);
   JSONObject result=new JSONObject();result.put("coords",coords);result.put("timestamp",location.getTime());payload=result.toString();
  }catch(org.json.JSONException e){fail(2);return;}
  for(String key:new ArrayList<>(jobs.keySet())){
   deliver(key,payload,0);if(!Boolean.TRUE.equals(jobs.get(key)))jobs.remove(key);
  }
  if(jobs.isEmpty())stopProvider();
 }
 private void deliver(String key,String payload,int error){
  if(local())browser.evaluateJavascript("if(window.receiveGuideLocation)window.receiveGuideLocation("+JSONObject.quote(key)+","+payload+","+error+");",null);
 }
 private void fail(int error){for(String key:new ArrayList<>(jobs.keySet()))deliver(key,"null",error);clear();}
 private void stopProvider(){if(listening){try{service.removeUpdates(this);}catch(SecurityException ignored){}listening=false;}}
 void foreground(){active=true;}
 void background(){active=false;if(!prompted)fail(4);}
 void clear(){jobs.clear();stopProvider();}
 @Override public void onProviderEnabled(String provider){}
 @Override public void onProviderDisabled(String provider){if(listening){stopProvider();subscribe();}}
 @Override public void onStatusChanged(String provider,int status,Bundle extras){}
}

