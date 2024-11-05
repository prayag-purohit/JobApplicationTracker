# JobApplicationTracker
These GoogleAppsScript in conjunction with the GeminiAPI, and GmailAPI. It tracks my job applications by going through my emails for a given search query

The script runs Gemni API through a two step process. 
1)Feeds a smaller model (8 billion parameters) the subject of an email. The smaller model determine if the email is relavent
2)If the email is deemed relavent,  then the body of the email is given to the bigger model.
  --The bigger model returns the status, job title, location, date, and email link for a given eamil. 
  
