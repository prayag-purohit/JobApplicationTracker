function queryGeminiforsubject(subjectplusbodysnip) {
  const properties = PropertiesService.getScriptProperties().getProperties();
  const geminiApiKey = properties['GOOGLE_API_KEY'];
  
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${geminiApiKey}`;
  
  
  const query = `I am tracking my job applications. Based on *the subject* alone, decide if the email contains information about:
  1) A confirmation of any job application (Usually marked by the words "Thank you for applying", or "Your application"), or
  2) An update on a previously made job application  (Usually marked by the words "Update" or "Application" or "Status")

  If it is either of these two, strictly return 1 (true) as an integer. If it is neither, strictly return 0 (false) as an integer.

  *The subject and body snippet: ${subjectplusbodysnip}*`;

  const payload = { contents: [{ parts: [{ text: query }] }] };

  const res = UrlFetchApp.fetch(geminiEndpoint, {
    payload: JSON.stringify(payload),
    contentType: "application/json",
  });
  const obj = JSON.parse(res.getContentText());
  if (
    obj.candidates &&
    obj.candidates.length > 0 &&
    obj.candidates[0].content.parts.length > 0
  ) {
    return obj.candidates[0].content.parts[0].text;
  } else {
    console.warn("No response.");
  }
  
}  

function queryGeminiforBody(subjectplusbody, date) {
  const searchQuery = 'from:rbc@myworkday.com';
  
  const properties = PropertiesService.getScriptProperties().getProperties();
  const geminiApiKey = properties['GOOGLE_API_KEY'];
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey;
  const temperature = 0.2;

  // Create the prompt
  const prompt = `Identify from this email if it is a confirmation of application or application status update or a rejection email. If you cannot identify the location, return that as "unavailable". You MUST provide your response in the following JSON format for confirmation of application emails "status" takes strictly three values:
  {
    "job_info": [
      {
        "status": "<applied/shortlisted/rejected>",
        "jobTitle": "<job title/if internship - job title with term>",
        "company": "<company>",
        "location": "<location/remote/unavailable>",
        "update": "<update if status shortlisted (max three words)/rejected/null>"
      }
    ]
  }
  DO NOT INCLUDE ANY SYNTAX HIGHLIGHTING OR CODE BLOCK FORMATTING. Here is the email: ${subjectplusbody}`;

  // Construct the API payload
  const payload = {
    "contents": [
      {
        "parts": [
          {
            "text": prompt
          },
        ]
      }
    ], 
    "generationConfig":  {
      "temperature": 0.2,
    },
  };

  const options = { 
    'method' : 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };

  // Make the API call and handle the response
  const response = UrlFetchApp.fetch(endpoint, options);
  const jsonResponse = JSON.parse(response.getContentText());
  const totalTokenCount = jsonResponse.usageMetadata.totalTokenCount;
  
  const jobInfo = JSON.parse(jsonResponse.candidates[0].content.parts[0].text).job_info[0];
  return jobInfo
  
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-based
  const year = date.getFullYear();
  return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
}

function input_to_sheet(status, jobTitle, company, location, update, date, emailLink) {
  // Open the spreadsheet using its URL
  const spreadsheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1dIeTZIikIFuTF_QgEhN7EjbNkBqZhyuBRVTy2Qa1sxU/edit#gid=0");
  
  // Access the "Job Applications" sheet
  let sheet = spreadsheet.getSheetByName("Job Applications");

  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;

  sheet.getRange(nextRow, 1).setValue(status);
  sheet.getRange(nextRow, 2).setValue(jobTitle);
  sheet.getRange(nextRow, 3).setValue(company);
  sheet.getRange(nextRow, 4).setValue(location);
  sheet.getRange(nextRow, 5).setValue(update);
  sheet.getRange(nextRow, 6).setValue(date);
  sheet.getRange(lastRow, 7).setValue(emailLink);
}
