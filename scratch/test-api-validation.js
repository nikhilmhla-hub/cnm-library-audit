const http = require('http');

const port = process.env.PORT || 3000;
const host = 'localhost';

function postLead(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: host,
      port: port,
      path: '/api/leads',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            rawBody: body
          });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

const tests = [
  // 1. Invalid names
  {
    name: "Empty Name",
    payload: { name: "", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid name."
  },
  {
    name: "Short Name (1 char)",
    payload: { name: "A", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid name."
  },
  {
    name: "Fake Name (test)",
    payload: { name: "test", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid name."
  },
  {
    name: "Repeated char name",
    payload: { name: "aaaa", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid name."
  },
  {
    name: "Short name (< 4 chars) and single word",
    payload: { name: "Avi", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid name."
  },
  {
    name: "Word with < 2 alphabetic characters",
    payload: { name: "A Sharma", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid name."
  },
  {
    name: "Invalid characters in name (digits)",
    payload: { name: "Avi123 Sharma", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid name."
  },
  
  // 2. Invalid phones
  {
    name: "Short Phone",
    payload: { name: "Avi Sharma", phone: "987654" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid mobile number."
  },
  {
    name: "Obsolete / doesn't start with 6-9",
    payload: { name: "Avi Sharma", phone: "5876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid mobile number."
  },
  {
    name: "8+ identical digits",
    payload: { name: "Avi Sharma", phone: "9999999901" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid mobile number."
  },
  {
    name: "First 6 digits identical",
    payload: { name: "Avi Sharma", phone: "9999991234" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid mobile number."
  },
  {
    name: "7+ repeating in sequence",
    payload: { name: "Avi Sharma", phone: "9888888812" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid mobile number."
  },
  {
    name: "Ascending sequence",
    payload: { name: "Avi Sharma", phone: "9801234567" }, // contains 0123456
    expectedStatus: 400,
    expectedMessage: "Please enter a valid mobile number."
  },
  {
    name: "Dummy number",
    payload: { name: "Avi Sharma", phone: "9876543210" },
    expectedStatus: 400,
    expectedMessage: "Please enter a valid mobile number."
  },
  
  // 3. Valid lead (should pass validation)
  {
    name: "Valid Lead",
    payload: { 
      name: "Avi Sharma", 
      phone: "9824681357", 
      class: "Class 11",
      exam: "JEE",
      overallScore: 78,
      archetype: "Exam Warrior",
      bottleneck: "None",
      status: "Audit Completed"
    },
    expectedStatus: 200,
    checkSource: true
  }
];

async function run() {
  console.log("Starting backend validation tests...\n");
  let passedCount = 0;
  
  for (const t of tests) {
    try {
      const res = await postLead(t.payload);
      const passed = res.statusCode === t.expectedStatus && 
                     (!t.expectedMessage || (res.data && res.data.message === t.expectedMessage));
      
      console.log(`Test: ${t.name}`);
      console.log(`Payload: ${JSON.stringify(t.payload)}`);
      console.log(`Expected Code: ${t.expectedStatus}, Got: ${res.statusCode}`);
      if (t.expectedMessage) {
        console.log(`Expected Msg:  "${t.expectedMessage}", Got: "${res.data ? res.data.message : 'N/A'}"`);
      }
      if (t.checkSource) {
        console.log(`Response Data: ${JSON.stringify(res.data)}`);
      }
      
      if (passed) {
        console.log("Result: \x1b[32mPASSED\x1b[0m\n");
        passedCount++;
      } else {
        console.log("Result: \x1b[31mFAILED\x1b[0m\n");
      }
    } catch (e) {
      console.log(`Test: ${t.name}`);
      console.log(`Error: Failed to connect to server. Make sure pnpm dev is running on port 3000. Msg: ${e.message}\n`);
    }
  }
  
  console.log(`Finished: ${passedCount} / ${tests.length} tests passed.`);
}

run();
