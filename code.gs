function getGmailMessages() {
  // Search query for job application emails received after August 1, 2024
  //const searchQuery = 'Application -{Linkedin Indeed catchafire} after:2024/5/5 before:2025/5/6';
  //const searchQuery = 'Job application -{hirist.tech, indeed, linkedin, glassdoor} after:2024/08/01'
  const searchQuery = "from:rbc@myworkday.com" 
  const threads = GmailApp.search(searchQuery, 0, 2); 
  let totalusedtokensinloop = 0
  // Loop through the threads, starting from the oldest thread
  for (let i = threads.length - 1; i >= 0; i--) {
    const messages = threads[i].getMessages();

    // Loop through the messages within each thread, starting from the oldest message
    for (let j = messages.length - 1; j >= 0; j--) {
      const message = messages[j];
      
      // Extract details from the email
      const date = message.getDate();
      const body = message.getPlainBody(); // Using plain text body for better compatibility
      const subjectplusbody = "subject: " + message.getSubject() + " body: " + body;
      const subjectplusbodysnip = message.getSubject() + " " + body.substring(0,100)
      
      const emailLink = message.getThread().getPermalink(); // Get the permalink to the thread

      const is_relavant = queryGeminiforsubject(subjectplusbodysnip);
      if(
        is_relavant == 1
      ){
        var {jobInfo, totalTokenCount} = queryGeminiforBody(subjectplusbody, date)
        // Check if 'joninfo' exists and has elements
      
      if (jobInfo) {
        try {
              const status = jobInfo.status;
              const jobTitle = jobInfo.jobTitle;
              const company = jobInfo.company;
              const location = jobInfo.location;
              const update = jobInfo.update;

              // Format the date
              const formattedDate = formatDate(date);

              totalusedtokensinloop += totalTokenCount
              

              // Call the function to input data into the sheet
              input_to_sheet(status, jobTitle, company, location, update, formattedDate, emailLink);
              Logger.log("input 1 email to the sheet, " + " Total tokens used: " + totalusedtokensinloop);
        } catch (parseError) {
          Logger.log("Error parsing job info: " + parseError);
          }
      } else {
        Logger.log("No valid content found in the response.");
      }    
          }
          else{
            Logger.log("Skipped: " + subjectplusbodysnip.substring(0,60))
            continue
          } 
    }
  }
}





