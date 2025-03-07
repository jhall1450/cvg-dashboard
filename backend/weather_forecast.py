from dotenv import load_dotenv
import base64
import requests
import json
import datetime
import os
import pytz
import firebase_admin
from firebase_admin import credentials, firestore

def main():
  if os.environ.get('ENVIRONMENT') != 'production':
    load_dotenv()

  try:
    weatherAPIKey = os.environ["WEATHERAPIKEY"]
  except KeyError:
      raise Exception("Weather API key not available!")
  
  try:
    firestoreKeyEncoded = os.environ["FIRESTOREKEY"]
  except KeyError:
      raise Exception("Firestore key not available!")
  
  firestoreKey = json.loads(base64.b64decode(firestoreKeyEncoded).decode('utf-8'))

  cred = credentials.Certificate(firestoreKey)
  firebase_admin.initialize_app(cred)
  db = firestore.client()

  location = "39.04456,-84.67229"
  forecastDays = 1
  airQualityInfo = "no"
  weatherAlerts = "no"
  url = "https://api.weatherapi.com/v1/forecast.json?key={}&q={}&days={}&aqi={}&alerts={}".format(weatherAPIKey,location,forecastDays,airQualityInfo,weatherAlerts)

  res = requests.get(url)
  data = json.loads(res.text)

  forecastArray = []

  et_tz = pytz.timezone('US/Eastern')
  utc_tz = pytz.timezone('UTC')

  for i in data["forecast"]["forecastday"]:
     for j in i["hour"]:
        datetime_obj = datetime.datetime.fromtimestamp(j["time_epoch"])
        datetime_et = et_tz.localize(datetime_obj)
        datetime_utc = datetime_et.astimezone(utc_tz)

        hour_object = {
          "time" : datetime_utc,
          "condition_text" : j["condition"]["text"],
          "condition_icon" : j["condition"]["icon"],
          "temp_f" : j["temp_f"],
          "wind_mph" : j["wind_mph"],
          "gust_mph" : j["gust_mph"],
          "wind_degree" : j["wind_degree"],
          "wind_dir" : j["wind_dir"]
        }

        forecastArray.append(hour_object)
        
  now_utc = datetime.datetime.now(datetime.timezone.utc)

  firestore_object = {
     "last_updated" : now_utc,
     "hour" : forecastArray
  }

  doc_ref = db.collection("primary").document("weather_forecast_latest")
  doc_ref.set(firestore_object)


if __name__ == '__main__':
    main()