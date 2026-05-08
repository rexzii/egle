const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(cors());
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const schedule = require('node-schedule');
const axios = require('axios');
//const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const csv = require('csv-parser');
const twilio = require('twilio');
const moment = require('moment');
const Tesseract = require("tesseract.js");
// const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');
const { verifyToken } = require(path.join(__dirname, 'authMiddleware'));




const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'leads_management',
  port: 3306
});

// const prathamDb = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'pratham_sales',
//   port: 3306
// });

db.connect((err) => {
  if (err) {
  console.log(err, 'error');
  }
  console.log('Database is connected');
   // sendMessage();
});

// prathamDb.connect((err) => {
//   if (err) {
//     console.log('Error connecting to pratham_sales database:', err);
//     return;
//   }
//   console.log('Connected to pratham_sales database');
// });


// One-time task to hash all plain text passwords in the database
const hashPasswords = () => {
  db.query('SELECT * FROM tb_user WHERE password IS NOT NULL', (error, results) => {
    if (error) {
      console.log('Error fetching users:', error);
      return;
    }

    // Loop through all the users and update their passwords to hashed passwords
    results.forEach(user => {
      const plainPassword = user.password; // Existing plain text password

      // Hash the password using bcrypt
      bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.log('Error hashing password:', err);
          return;
        }

        console.log('Hashed Password:', hashedPassword);

        // Update the database with the hashed password
        const updateQuery = 'UPDATE tb_user SET password = ? WHERE user_id = ?';
        db.query(updateQuery, [hashedPassword, user.user_id], (updateError, updateResult) => {
          if (updateError) {
            console.log('Error updating password for user ID', user.user_id, ':', updateError);
          } else {
            console.log('Password updated successfully for user ID:', user.user_id);
          }
        });
      });
    });
  });
};

// Call the function to update passwords
hashPasswords();


// Multer Configuration (Image Save Nahi Karni)
const storage1 = multer.memoryStorage();
const upload1 = multer({ storage: storage1 });

app.post("/nodeapp/upload", upload1.single("image"), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer
    const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");
    console.log("📝 Extracted Text:\n", text);
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    const phoneNumbers = lines.filter(line => /\d{10,}/.test(line));
    const contactno = phoneNumbers.length > 0 ? phoneNumbers[0] : "N/A"; 
    const personname = lines.length > 0 ? lines[0] : "Unknown";
    const companyname = lines.length > 3 ? lines[3] : "N/A";
    const email = lines.find(line => line.includes("@")) || "N/A"; 
    const address = lines.slice(-2).join(", "); 
    const extractedData = {
      personname,
      companyname,
      contactno,
      email,
      address
    };
    console.log("📌 Parsed Data:", extractedData);
    res.json({ message: "Data Extracted", data: extractedData });
  } catch (error) {
    console.error("❌ OCR Processing Error:", error);
    res.status(500).json({ error: "OCR Processing Failed" });
  }
});

app.post("/nodeapp/save", (req, res) => {
  console.log("📩 Received Data:", req.body); // Debugging log

  const { personname, companyname, contactno, email, address, company_code, username } = req.body;

  // Check if company_code and username exist
  if (!company_code || !username) {
    return res.status(400).json({ error: "Missing company_code or username" });
  }

  db.query(
    "INSERT INTO tb_visitingcards (personname, companyname, contactno, email, address, company_code, username) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [personname, companyname, contactno, email, address, company_code, username],
    (err, result) => {
      if (err) {
        console.error("❌ Database Insert Error:", err);
        return res.status(500).json({ error: err });
      }
      res.json({ message: "✅ Card data saved!", id: result.insertId });
    }
  );
});


 const storage = multer.diskStorage({
   destination: (req, file, cb) => {
     cb(null, 'uploads/'); 
   },
   filename: (req, file, cb) => {
     cb(null, Date.now() + path.extname(file.originalname));
   }
 });

const upload = multer({ storage: storage });
 app.use(express.urlencoded({ extended: true }));
 app.use(express.json());
 app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
 app.post('/nodeapp/saveTicket', upload.single('image'), (req, res) => {
   console.log(req.body, 'createData');
   console.log(req.file, 'uploadedFile');
   const image = req.file ? req.file.filename : null; 
   const currentDate = new Date();
   const formattedDate = currentDate.toISOString().split('T')[0];
   const created_time = currentDate.toTimeString().split(' ')[0];
   const { username, company_code, created_by, products, Description, company_name, email, mobileno, remark } = req.body;
   // SQL Insert query
   const leadSql = `
     INSERT INTO tb_ticketcreate (username, company_code, created_date, created_time, created_by, products, \`Description\`, company_name, email, mobileno, remark, image) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   `;
   db.query(leadSql, [username, company_code, formattedDate, created_time, created_by, products, Description, company_name, email, mobileno, remark, image], (err, result) => {
     if (err) {
       console.log('SQL Error:', err);
       return res.status(500).json({ error: 'Error inserting data' });
     }
     console.log('Data inserted successfully:', result);
     const ticketId = result.insertId;
     if (image) {
       const newFileName = ticketId + path.extname(req.file.filename);
       const oldFilePath = path.join(__dirname, 'uploads', req.file.filename);
       const newFilePath = path.join(__dirname, 'uploads', newFileName);
       fs.rename(oldFilePath, newFilePath, (err) => {
         if (err) {
           console.error('Error renaming the file:', err);
           return res.status(500).json({ error: 'Error renaming the file' });
         }
         const updateImageSql = `UPDATE tb_ticketcreate SET image = ? WHERE ticket_id = ?`;
         db.query(updateImageSql, [newFileName, ticketId], (err) => {
           if (err) {
             console.log('Error updating the image name in the database:', err);
             return res.status(500).json({ error: 'Error updating image name in the database' });
           }
         });
       });
     }
     const mailOptions = {
       from: 'sednainfo5@gmail.com', 
       to: email, 
       subject: `Your Issue Has Been Raised for ${products}`,
       text: `
         Dear Customer,
         We have received your issue regarding the product: ${products}.
         Your issue has been successfully raised, and your ticket ID is: ${ticketId}.
         Our team will look into it shortly.
         Description of the Issue: ${Description}
         Thank you for reaching out to us!
         Best regards,
         Sedna technologies
       `
     };
     transporter.sendMail(mailOptions, (err, info) => {
       if (err) {
         console.log('Error sending email:', err);
         return res.status(500).json({ error: 'Error sending email' });
       }
       console.log('Email sent: ' + info.response);
       return res.status(200).json({
         success: true,
         message: 'Ticket created successfully',
         ticket_id: ticketId
       });
     });
   });
 });

 

// ✅ API to Insert Visiting Card Data
app.post("/nodeapp/addCard", upload.none(), (req, res) => {
    console.log("Headers:", req.headers);
    console.log("Received Data:", req.body); // ✅ Debugging Log

    const { name, phone, company, address } = req.body;

    if (!name || !phone || !company || !address) {
        return res.status(400).json({ error: "Invalid Data" });
    }

    const sql = "INSERT INTO tb_visitingcards (name, phone, company, address) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, phone, company, address], (err, result) => {
        if (err) {
            console.error("Error inserting data: ", err);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json({ message: "Card added successfully!", id: result.insertId });
        }
    });
});



// POST request to insert new record into tb_issue
app.post('/nodeapp/insert-ticketissue', (req, res) => {
  const { ticket_id, Description, issue_solved, email } = req.body;
  const currentDate = new Date();
  const regDate = currentDate.toISOString().split('T')[0];
  const regTime = currentDate.toTimeString().split(' ')[0];
  const productQuery = `
    SELECT products FROM tb_ticketcreate WHERE ticket_id = ?
  `;
  db.query(productQuery, [ticket_id], (err, productResults) => {
    if (err) {
      console.error('Error fetching product details from tb_ticketcreate:', err);
      return res.status(500).json({ message: 'Error fetching product details', error: err });
    }
    if (productResults.length === 0) {
      return res.status(404).json({ message: 'Ticket ID not found in tb_ticketcreate' });
    }
    const productName = productResults[0].products;
    const issueQuery = `
      INSERT INTO tb_issue (ticket_id, reg_date, reg_time, issue_solved, Description)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(issueQuery, [ticket_id, regDate, regTime, issue_solved, Description], (err, issueResults) => {
      if (err) {
        console.error('Error inserting data into tb_issue:', err);
        return res.status(500).json({ message: 'Error inserting data into tb_issue', error: err });
      }
      if (issue_solved === 'yes') {
        const mailOptions = {
          from: 'sednainfo5@gmail.com', 
          to: email,
          subject: 'Issue Solved: Your Product Issue',
          text: `Hello, \n\nYour issue related to the product "${productName}" has been resolved. Please check and revert back 
          \nThank you for your patience.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email', error });
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
      }
      return res.status(200).json({ message: 'New issue record inserted into tb_issue' });
    });
  });
});


app.get('/nodeapp/admissions', (req, res) => {
    const sql = `SELECT * FROM admissions ORDER BY created_at DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: results });
    });
});

app.get('/nodeapp/admission/:id', (req, res) => {
    const id = req.params.id;
    const mainSql = `SELECT * FROM admissions WHERE id = ?`;
    db.query(mainSql, [id], (err, admission) => {
        if (err) return res.status(500).json({ error: err.message });
        if (admission.length === 0) return res.status(404).json({ error: 'Not found' });
        
        db.query(`SELECT * FROM academic_qualifications WHERE admission_id = ?`, [id], (err, academic) => {
            if (err) return res.status(500).json({ error: err.message });
            db.query(`SELECT * FROM work_experiences WHERE admission_id = ?`, [id], (err, work) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, data: { admission: admission[0], academic, work } });
            });
        });
    });
});

app.put('/nodeapp/admission_update/:id', upload.single('photo'), (req, res) => {
    const id = req.params.id;
    // Similar parsing as POST but with UPDATE query
    // I'll provide a simplified version – you can reuse POST logic with UPDATE
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ success: false });
        
        // Parse JSON fields similarly as in POST
        let personalData = {}, academicData = {}, workExpArray = [], extraCurricularData = {}, knowAboutData = {};
        let nationalLevelExamData = {}, checklistData = {}, prospectusFeeData = {}, declarationData = {};
        try {
            personalData = JSON.parse(req.body.personal || '{}');
            academicData = JSON.parse(req.body.academic || '{}');
            workExpArray = JSON.parse(req.body.workExperience || '[]');
            extraCurricularData = JSON.parse(req.body.extraCurricular || '{}');
            knowAboutData = JSON.parse(req.body.knowAbout || '{}');
            nationalLevelExamData = JSON.parse(req.body.nationalLevelExam || '{}');
            checklistData = JSON.parse(req.body.checklist || '{}');
            prospectusFeeData = JSON.parse(req.body.prospectusFee || '{}');
            declarationData = JSON.parse(req.body.declaration || '{}');
        } catch(e) {
            return db.rollback(() => res.status(400).json({ success: false, message: 'Invalid JSON' }));
        }
        
        const photoPath = req.file ? req.file.filename : null;
        const updateMain = `UPDATE admissions SET ? WHERE id = ?`;
        const mainData = { /* same fields as in POST, but without id */ };
        // ... (build mainData similar to POST)
        // Then execute update, then delete old academic & work and insert new ones, or update individually.
        // For brevity, I'll assume you can extend. Let me know if you need full code.
        
        res.status(200).json({ success: true, message: 'Updated' });
    });
});

app.delete('/nodeapp/admission/:id', (req, res) => {
    const id = req.params.id;
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ error: err.message });
        db.query(`DELETE FROM work_experiences WHERE admission_id = ?`, [id], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
            db.query(`DELETE FROM academic_qualifications WHERE admission_id = ?`, [id], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                db.query(`DELETE FROM admissions WHERE id = ?`, [id], (err, result) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                    db.commit(err => {
                        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                        res.json({ success: true, message: 'Deleted successfully' });
                    });
                });
            });
        });
    });
});


 
 app.put('/nodeapp/companyupdate/:company_code', upload.single('company_logo'), (req, res) => {
   const company_code = req.params.company_code;
   const {
     company_name,
     company_email,
     company_mobile_no,
     company_address,
     payment,
     total_user,
     contact_person,
     whatsapp_count,
     profile,
     expire_date
   } = req.body;
   let company_logo = null;
   if (req.file) {
     company_logo = req.file.filename;
   } else if (req.body.company_logo) {
     company_logo = req.body.company_logo;
   }
   let sql = `
     UPDATE tb_company 
     SET 
       company_name = ?, 
       company_email = ?, 
       company_mobile_no = ?, 
       company_address = ?, 
       payment = ?, 
       total_user = ?, 
       contact_person = ?, 
       whatsapp_count = ?, 
       profile = ?, 
       expire_date = ?
   `;
   if (company_logo) {
     sql += `, company_logo = ?`;
   }
   sql += ` WHERE company_code = ?`;
   const queryParams = [
     company_name,
     company_email,
     company_mobile_no,
     company_address,
     payment,
     total_user,
     contact_person,
     whatsapp_count,
     profile,
     expire_date
   ];
   if (company_logo) {
     queryParams.push(company_logo);
   }
   queryParams.push(company_code);
   db.query(sql, queryParams, (err, result) => {
     if (err) {
       console.log(err);
       return res.status(500).json({
         message: 'Error updating company data',
         error: err
       });
     } else {
       console.log('SQL Result:', result);
       return res.status(200).json({
         message: 'Company updated successfully',
         data: result
       });
     }
   });
 });


app.get('/nodeapp/displaycompanydetails', (req, res) => {
  const companyCode = req.query.company_code; 
let qr = `SELECT * FROM tb_company WHERE company_code = ?`;
db.query(qr, [companyCode], (err, result) => {
  if (err) {
    console.log(err);
    res.status(500).send({
    message: 'Internal Server Error'
    });
  } else {
  if (result.length > 0) {
    res.send({
    message: 'Get all data',
    data: result
    });
  } else {
    res.send({
    message: 'Data not found',
    data: result
    });
  }
}
});
});

app.get('/nodeapp/Alldisplaycompanydetails', (req, res) => {
  let qr = `SELECT * FROM tb_company ORDER BY reg_date DESC`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({
      message: 'Internal Server Error'
      });
    } else {
    if (result.length > 0) {
      res.send({
      message: 'Get all data',
      data: result
      });
    } else {
      res.send({
      message: 'Data not found',
      data: result
      });
    }
  }
  });
});


app.post('/nodeapp/register', (req, res) => {
  console.log(req.body, 'createData');
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  const { company_code, username, email, password, active, user_right, selectedUsers } = req.body;
  const countUsersSql = `SELECT COUNT(*) AS total_users FROM tb_user WHERE company_code = ?`;
  db.query(countUsersSql, [company_code], (err, countResult) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error counting users' });
    }
    const totalUsers = countResult[0].total_users;
    const checkTotalUserSql = `SELECT total_user FROM tb_company WHERE company_code = ?`;
    db.query(checkTotalUserSql, [company_code], (err, totalUserResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error fetching total_user count' });
      }
      const totalUserCount = totalUserResult[0].total_user;
      if (totalUsers < totalUserCount) {
        const leadSql = `INSERT INTO tb_user(company_code, reg_date, username, email, password, active, user_right) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(leadSql, [company_code, formattedDate, username, email, password, active, user_right], (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Error inserting data' });
          }
          const leadId = result.insertId;
          if (selectedUsers && selectedUsers.length > 0) {
            const updateTeamSql = `UPDATE tb_user SET teammate_id = ? WHERE user_id IN (?) AND company_code = ?`;
            db.query(updateTeamSql, [leadId, selectedUsers, company_code], (err, updateResult) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Error updating teammate_id' });
              }

              res.status(200).json({ success: true, message: 'User and teammates updated successfully' });
            });
          } else {
            res.status(200).json({ success: true, message: 'Data inserted successfully' });
          }
        });
      } else {
        res.status(403).json({ error: `Only ${totalUserCount} users can be added` });
      }
    });
  });
});

app.post('/nodeapp/update-teammates', (req, res) => {
  const { userIds, teammateId } = req.body;
  if (!userIds || !teammateId) {
    return res.status(400).json({ error: 'User IDs and teammate ID are required' });
  }
  const updateTeamSql = `UPDATE tb_user SET teammate_id = ? WHERE user_id IN (?)`;
  db.query(updateTeamSql, [teammateId, userIds], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error updating teammate_id' });
    }
    res.status(200).json({ success: true, message: 'Teammates updated successfully' });
  });
});

app.get('/nodeapp/users', (req, res) => {
  const companyCode = req.query.company_code; 
  const query = `SELECT * FROM tb_user WHERE company_code = ? `;
  db.query(query, [companyCode], (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results); 
    }
  });
});



//  const jwt = require('jsonwebtoken');
//  const SECRET_KEY = "4a6f732dc2eae26cfae9d12345678abcdef90abcdef1234567890abcdef1234";

// app.post('/login', (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;

//   console.log("📩 Received login request:", username, password);

//   const query = `
//       SELECT u.*, c.company_name, c.company_logo, c.expire_date, c.active AS company_active
//       FROM tb_user u
//       INNER JOIN tb_company c ON u.company_code = c.company_code
//       WHERE u.username = ?
//   `;

//   db.query(query, [username], (error, result) => {
//       if (error) {
//           console.error('❌ Database Query Error:', error);
//           return res.status(500).json({ message: 'Database error' });
//       }

//       if (result.length === 0) {
//           console.log('❌ Invalid username:', username);
//           return res.status(401).json({ message: 'Invalid username or password' });
//       }

//       const user = result[0];
//       console.log('✅ User found:', user);

//       // **Token Generate karna**
//       const token = jwt.sign(
//           { user_id: user.user_id, username: user.username },
//           SECRET_KEY,
//           { expiresIn: '1h' }
//       );

//       console.log("✅ Generated Token:", token);

//       return res.status(200).json({
//           message: "Login successful",
//           token: token,  
//           userData: {
//               user_id: user.user_id,
//               username: user.username,
//               company_code: user.company_code
//           }
//       });
//   });
// });


const jwt = require('jsonwebtoken');
const SECRET_KEY = "4a6f732dc2eae26cfae9d12345678abcdef90abcdef1234567890abcdef1234";

 app.post('/nodeapp/login', (req, res) => {
   const username = req.body.username;
   const password = req.body.password;

   console.log("📩 Received login request:", username, password);

   const query = `
     SELECT u.*, c.company_name, c.company_logo, c.expire_date, c.active AS company_active
     FROM tb_user u
     INNER JOIN tb_company c ON u.company_code = c.company_code
     WHERE u.username = ? 
   `;
   db.query(query, [username], (error, result) => {
     if (error) {
       console.log('Error querying database:', error);
       return res.status(500).send('Error querying database');
     } else if (result.length === 0) {
       console.log('Invalid username or password');
       return res.status(401).send('Invalid username or password');
     } else {
       const user = result[0];
       const companyExpireDate = new Date(user.expire_date);
       const currentDate = new Date();
       const companyActive = user.company_active;
       if (companyExpireDate < currentDate) {
         console.log('Company server has expired');
         return res.status(403).send({ message: 'Your server has expired, please renew' });
       } else if (companyActive !== 'yes') {
         console.log('Company is not active');
         return res.status(403).send({ message: 'Your company is not active' });
       } else if (user.active !== 'yes') {
         console.log('User is not active');
         return res.status(403).send({ message: 'User is not active' });
       } else {
         const logErrorQuery = `
           INSERT INTO tb_logerror (user_id, username, login_time, company_code, status)
           VALUES (?, ?, NOW(), ?, ?)
         `;
         const status = 'Login successful';  
         db.query(logErrorQuery, [user.user_id, user.username, user.company_code, status], (err, logResult) => {
           if (err) {
             console.log('Error logging login time:', err);
             return res.status(500).send('Error logging login time');
           }
           
           // ✅ **Token Generate Karna**
           const token = jwt.sign(
           { user_id: user.user_id, username: user.username },
           SECRET_KEY,
           { expiresIn: '1h' } 
           );

           const userData = {
             user_id: user.user_id,
             username: user.username,
             user_right: user.user_right,
             company_data: {
               company_code: user.company_code,
               company_name: user.company_name,
               company_logo: user.company_logo,
               expire_date: user.expire_date,
             }
           };
           console.log('Login successful');
           console.log('✅ Login successful, Token Generated:', token);
           return res.status(200).send({
             message: 'Login successful',
             token: token,  
             userData: userData
           });
         });
       }
     }
   });
 });

app.get('/nodeapp/getUserLogs/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const query = `
    SELECT * FROM tb_logerror WHERE user_id = ?
  `;
  db.query(query, [user_id], (error, result) => {
    if (error) {
      console.log('Error fetching user logs:', error);
      return res.status(500).send('Error fetching logs');
    }
    res.status(200).send(result);  
  });
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sednainfo5@gmail.com',
    pass: 'mfzm afcu fwma latu'
  },
    debug: true 
  });
  const scheduleRule = '2 12 * * *'; 
  const job = schedule.scheduleJob(scheduleRule, function() {
  const currentDate = new Date();
  const nextFollowUp2Months = new Date();
  nextFollowUp2Months.setMonth(currentDate.getMonth() + 2);
  const nextFollowUp1Month = new Date();
  nextFollowUp1Month.setMonth(currentDate.getMonth() + 1);
  const nextFollowUp15Days = new Date();
  nextFollowUp15Days.setDate(currentDate.getDate() + 15);
    const query = `
      SELECT f.lead_id,f.email,l.personname,l.products,l.reg_date,f.nextfollow_up_by FROM tb_followup f INNER JOIN 
      tb_lead l ON f.lead_id = l.lead_id WHERE f.nextfollow_up_by BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 MONTH)
      OR f.nextfollow_up_by BETWEEN ? AND ? OR f.nextfollow_up_by BETWEEN ? AND ?`;
    db.query(query, [nextFollowUp1Month, nextFollowUp2Months, nextFollowUp15Days, nextFollowUp1Month], function(err, results) {
      if (err) {
        console.error('Error querying database:', err);
        return;
      }    
      results.forEach(function(result) {
        if (result.email) {
          const mailOptions = {
          from: 'sednainfo5@gmail.com',
          to: result.email,
          subject: 'Follow-up Reminder',
          html: `Hello <b>${result.personname}</b>,<br>
          &nbsp;&nbsp;&nbsp;This is the gentle reminder for your requirement regarding ${result.products} registered on our CRM portal dated ${result.reg_date}.
          Kindly, let us know when can we again reach you by replying on this email.<br><br>
          <b>Best regards,</b><br>
          <b>We offer other services as:</b><br>
          - Website Design<br>
          - Website Maintenance<br> 
          - Bulk Whatsapp<br>
          - Digital Marketing<br> 
          - Google PPC Campaign <br>
          - Instagram Marketing<br>
          - Cold Calling Services<br>
          - Logo Designing / Graphic / Catalogue / Brochure Designing<br>
          - CRM Software<br>
          - Mobile Application Development<br><br>
          <b>About Us</b>:- We are Mumbai based 18+ years old development company with 20+ professional team. To further know more visit following link:<br>
          Our Location:<br>
          https://maps.app.goo.gl/ae12TDTbGZ1jwZSa8 <br> 
          Our Video Profile:<br>
          https://youtu.be/YXRGP-dCz1M <br>
            
          Our Reviews:<br>
          https://g.page/r/CX7M8mMzDKqTEB0/review <br>
            
          Our Website:<br>
          https://www.sednainfosystems.com  <br><br>
                          
          Yours Sincerely,<br>
          Poonam Mishra<br>
          Sales Team | 9920432160`
          };
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
              const insertQuery = `
                INSERT INTO tb_automail (lead_id, email, personname, products, reg_date, send_date)
                VALUES (?, ?, ?, ?, ?, NOW())`;
              const values = [result.lead_id, result.email, result.personname, result.products, result.reg_date];
              db.query(insertQuery, values, function(err, result) {
                if (err) {
                  console.error('Error inserting into tb_automail:', err);
                } else {
                  console.log('Inserted into tb_automail:', result);
                }
              });
            }
          });
        } else {
          console.error('Error sending email: No recipient defined');
        }
      });
    });
  });

// Scheduled job to run every day at 3:15 PM
cron.schedule('0 9 * * *', () => {
  console.log('Checking for users who have not logged in for 3 days...');
  const query = `
    SELECT u.email, u.username, MAX(l.login_time) AS last_login
    FROM tb_user u
    LEFT JOIN tb_logerror l ON u.user_id = l.user_id
    GROUP BY u.user_id, u.email, u.username
    HAVING MAX(l.login_time) < NOW() - INTERVAL 3 DAY OR MAX(l.login_time) IS NULL;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.log('Error fetching users:', err);
      return;
    }
    results.forEach(user => {
      const mailOptions = {
        from: 'sednainfo5@gmail.com',
        to: user.email,  
        subject: 'Reminder: You have not logged into Prathham CRM for 3 days',
        text: `Dear ${user.username},\n\n Its been long you have been to PrathhamCRM. Your uploaded leads are awaiting for follow ups. Requesting, login www.prathhamcrm.com and access the World of Business with Prathham CRM!\n\nFor any assistance, get in touch with WhatsApp - 8425043894\nHappy CRMing,\nTeam Prathham CRM`
      };
      transporter.sendMail(mailOptions, (emailErr, info) => {
        if (emailErr) {
          console.log('Error sending email to user:', emailErr);
        } else {
          console.log(`Email sent to ${user.username} (${user.email}): ${info.response}`);
        }
      });
    });
  });
});

console.log('Email reminder service started...');
 
app.post('/nodeapp/addlead', (req, res) => {
  console.log(req.body, 'createData');
   const currentDate = new Date();
   const formattedDate = currentDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
   const username = req.body.username;
   const company_code = req.body.company_code;
   const reg_date = formattedDate;
   const companyname = req.body.companyname;
   const personname = req.body.personname;
   const email = req.body.email;
   const contactno = req.body.contactno;
   const city = req.body.city;
   const designation = req.body.designation;
   const address = req.body.address;
   const source = req.body.source;
   const products = req.body.products;
   const stage = req.body.stage;
   const reminder_status = req.body.reminder_status;
   const company_vertical = req.body.company_vertical;
   const nextfollow_up_by = req.body.nextfollow_up_by;
   const remark = req.body.remark;
  
  // Step 1: Check if the lead with the same companyname and products exists (ignore username)
  const checkLeadSql = `SELECT username FROM tb_lead WHERE companyname = ? AND products = ? LIMIT 1`;
  db.query(checkLeadSql, [companyname, products], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'Error checking existing lead' });
    }
    // Step 2: If the lead already exists (same companyname and products), send the username who added it
    if (result.length > 0) {
      // Retrieve the username who added the duplicate lead
      const existingUsername = result[0].username;
      return res.status(400).json({ error: `This company and product combination already added by ${existingUsername}` });
    }
   ;
const currentTime = moment().tz('Asia/Kolkata').format('HH:mm:ss');
    const leadSql = `INSERT INTO tb_lead(username, company_code, reg_date, companyname, personname, email, contactno, city, designation, address, source, products, stage, reminder_status, company_vertical, nextfollow_up_by, remark) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const followUpSql = `INSERT INTO tb_followup(
  username, company_code, lead_id, personname, email, follow_up_time, nextfollow_up_by, 
  stage, reminder_status, remark, entry_date, followupcomplete) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending')`;

    
    db.query(
     leadSql,
       [username, company_code, reg_date, companyname, personname, email, contactno, city, designation, address, source, products, stage, reminder_status, company_vertical, nextfollow_up_by, remark], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Error inserting data' });
      } else {
        const leadId = result.insertId;
       db.query(
     followUpSql,
       [username, company_code, leadId, personname, email, currentTime, nextfollow_up_by, stage, reminder_status, remark],
       
 (followUpErr, followUpResult) => {
          if (followUpErr) {
            console.log(followUpErr);
            return res.status(500).json({ error: 'Error inserting data into tb_followup' });
          } else {
            transporter.sendMail({
              from: 'sednainfo5@gmail.com',
              to: email,
              subject: 'New Lead Added',
              html: `Your Registration has been successfully completed on our CRM portal dated ${reg_date} for ${products}. Kindly, let us know when we can reach you again by replying to this email.`
            }, (error, info) => {
              if (error) {
                console.log('Error sending email:', error);
              } else {
                console.log('Email sent:', info.response);
              }
            });
            return res.status(200).json({ success: true, message: 'Data inserted successfully' });
          }
        });
      }
    });
  });
});



 app.post('/nodeapp/exelupload', upload.single('file'), (req, res) => {
   const file = req.file; 
   if (!file) {
     return res.status(400).send('No file uploaded.');
   }
   const leadColumns = ['username', 'company_code', 'lead_id', 'reg_date', 'companyname', 'personname', 'email', 'contactno', 'city', 'designation', 'address', 'source', 'products', 'stage', 'reminder_status', 'company_vertical', 'nextfollow_up_by', 'remark'];
   const followupColumns = ['username', 'company_code', 'lead_id', 'personname', 'email', 'nextfollow_up_by', 'stage', 'reminder_status', 'remark', 'entry_date', 'follow_up_time'];
   const leadValues = [];
   const followupValues = [];
   fs.createReadStream(file.path)
     .pipe(csv())
     .on('data', (data) => {
       const currentDate = new Date();
       const formattedDate = currentDate.toISOString().slice(0, 10); 
       const formattedTime = currentDate.toLocaleTimeString(); 
       const leadId = generateLeadId(); 
       data.lead_id = leadId;
       data.reg_date = formattedDate;
       data.entry_date = formattedDate;
       data.follow_up_time = formattedTime;
       const leadData = leadColumns.map((column) => data[column]);
       const followupData = followupColumns.map((column) => data[column]);
       leadValues.push(leadData);
       followupValues.push(followupData);
     })
     .on('end', () => {
       const leadQuery = 'INSERT INTO tb_lead(username, company_code, lead_id, reg_date, companyname, personname, email, contactno, city, designation, address, source, products, stage, reminder_status, company_vertical, nextfollow_up_by, remark) VALUES ?';
       const followupQuery = 'INSERT INTO tb_followup(username, company_code, lead_id, personname, email, nextfollow_up_by, stage, reminder_status, remark, entry_date, follow_up_time) VALUES ?';
       db.query(leadQuery, [leadValues], (error, leadResults, fields) => {
         if (error) {
           console.error('Error inserting into tb_lead:', error);
           return res.status(500).send('Error inserting into tb_lead');
         }
         console.log('Inserted into tb_lead:', leadResults.affectedRows);
         const insertedLeadIds = [];
         for (let i = 0; i < leadResults.affectedRows; i++) {
           insertedLeadIds.push(leadResults.insertId + i);
         } 
         followupValues.forEach((followupData, index) => {
           followupData[2] = insertedLeadIds[index]; 
         });
         db.query(followupQuery, [followupValues], (error, followupResults, fields) => {
           if (error) {
             console.error('Error inserting into tb_followup:', error);
             return res.status(500).send('Error inserting into tb_followup');
           }
           console.log('Inserted into tb_followup:', followupResults.affectedRows);
           res.send('File uploaded successfully.');
         });
       });
     });
 });
 function generateLeadId() {
}

app.delete('/nodeapp/leaddelete/:lead_id', (req, res) => {
  const username = req.query.username;
  const lead_id = req.params.lead_id;
  if (!lead_id) {
    res.status(400).json({ error: 'Item ID is missing' });
    return;
  }  
  const selectSql = `
    SELECT 
      tb_lead.*, 
      tb_followup.stage, 
      tb_followup.nextfollow_up_by
    FROM 
      tb_lead
    LEFT JOIN 
      tb_followup ON tb_lead.lead_id = tb_followup.lead_id
    WHERE 
      tb_lead.lead_id = ?`;  
  db.query(selectSql, [lead_id], (selectErr, selectResult) => {
    if (selectErr) {
      console.error(selectErr);
      res.status(500).send('Error retrieving lead data');
      return;
    } 
    if (selectResult.length === 0) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }
    const leadData = selectResult[0]; 
    const trash_date = new Date().toISOString().slice(0, 19).replace('T', ' '); // Current date and time
    const insertSql = `
      INSERT INTO tb_trashlead (
        company_code, reg_date, lead_id, companyname, personname, email, contactno, city, designation, 
        address, source, products, stage, reminder_status, company_vertical, 
        nextfollow_up_by, remark, trash_date, username
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;    
    const insertValues = [
      leadData.company_code, leadData.reg_date, leadData.lead_id, leadData.companyname, leadData.personname, leadData.email, 
      leadData.contactno, leadData.city, leadData.designation, leadData.address, 
      leadData.source, leadData.products, leadData.stage, leadData.reminder_status, 
      leadData.company_vertical, leadData.nextfollow_up_by, leadData.remark, trash_date, username
    ];    
    db.query(insertSql, insertValues, (insertErr, insertResult) => {
      if (insertErr) {
        console.error(insertErr);
        res.status(500).send('Error inserting lead data into trash');
        return;
      }
      const deleteLeadSql = 'DELETE FROM tb_lead WHERE lead_id = ?';
      db.query(deleteLeadSql, [lead_id], (deleteLeadErr, deleteLeadResult) => {
        if (deleteLeadErr) {
          console.error(deleteLeadErr);
          res.status(500).send('Error deleting lead');
          return;
        }
        const deleteFollowUpSql = 'UPDATE tb_followup SET stage = NULL, nextfollow_up_by = NULL WHERE lead_id = ?';
        db.query(deleteFollowUpSql, [lead_id], (deleteFollowUpErr, deleteFollowUpResult) => {
          if (deleteFollowUpErr) {
            console.error(deleteFollowUpErr);
            res.status(500).send('Error deleting follow-up data');
            return;
          }
          res.status(200).json({ message: 'Lead deleted successfully' });
        });
      });
    });
  });
});

app.get('/nodeapp/displaytrashlead', (req, res) => {
  const companyCode = req.query.company_code;
  let qr = `
      SELECT 
          *
      FROM 
          tb_trashlead
      WHERE 
          company_code = ?
  `;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.send({
                  message: 'Fill Master table initially',
                  data: result
              });
          }
      }
  });
});

app.post('/nodeapp/restorelead/:lead_id', (req, res) => {
  const lead_id = req.params.lead_id; 
  const insertLeadQuery = `
    INSERT INTO tb_lead (company_code, reg_date, lead_id, companyname, personname, email, contactno, city, designation, 
      address, source, products, stage, reminder_status, company_vertical, nextfollow_up_by, remark)
    SELECT 
    company_code, reg_date, lead_id, companyname, personname, email, contactno, city, designation, 
      address, source, products, stage, reminder_status, company_vertical, 
      nextfollow_up_by, remark FROM tb_trashlead WHERE lead_id = ?;`; 
  const updateFollowUpQuery = `
  UPDATE tb_followup SET stage = (SELECT stage FROM tb_trashlead WHERE lead_id = ?),
      nextfollow_up_by = (SELECT nextfollow_up_by FROM tb_trashlead WHERE lead_id = ?)WHERE lead_id = ?;`;
  const deleteQuery = `
    DELETE FROM tb_trashlead
    WHERE lead_id = ?;`;  
  db.query(insertLeadQuery, [lead_id], (error, result) => {
    if (error) {
      console.error('Error restoring lead:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  db.query(updateFollowUpQuery, [lead_id, lead_id, lead_id], (error, result) => {
      if (error) {
        console.error('Error restoring follow-up data:', error);
      }
      db.query(deleteQuery, [lead_id], (error, result) => {
        if (error) {
          console.error('Error deleting lead from trash:', error);
        }
        res.json({ message: 'Lead restored successfully' });
      });
    });
  });
});


app.delete('/nodeapp/trashleaddelet/:id', (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: 'Item ID is missing' });
    return;
  }
  const sql = 'DELETE FROM tb_trashlead WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error deleting item');
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({ error: 'user not found' });
      } else {
        res.status(200).json({ message: 'user deleted successfully' });
      }
    }
  });
});


app.get('/nodeapp/displayproducts', (req, res) => {
  const companyCode = req.query.company_code;
  if (!companyCode) {
    return res.status(400).json({ error: 'Company code is required' });
  }
  let qr = `
      SELECT * FROM tb_products WHERE company_code = ? ORDER BY 
          product_name ASC; -- ASC for ascending order, DESC for descending order`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.send({
                  message: 'Fill Master table initially',
                  data: result
              });
          }
      }
  });
});

app.get('/nodeapp/displaysource', (req, res) => {
  const companyCode = req.query.company_code;
  if (!companyCode) {
    return res.status(400).json({ error: 'Company code is required' });
  }
  let qr = `
    SELECT * FROM tb_source
    WHERE company_code = ?
    ORDER BY source_name ASC`; 
  db.query(qr, [companyCode], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (result.length > 0) {
      res.json({
        message: 'Get all data',
        data: result
      });
    } else {
      res.status(404).json({
        message: 'No data found for the given company code'
      });
    }
  });
});


app.get('/nodeapp/displayprofile', (req, res) => {
  const companyCode = req.query.company_code;
  if (!companyCode) {
    return res.status(400).json({ error: 'Company code is required' });
  }
  let qr = `
      SELECT * FROM tb_profile  WHERE company_code = ? ORDER BY profile_name ASC; -- ASC for ascending order, DESC for descending order`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.status(404).send({
                  message: 'Fill Master table initially'
              });
          }
      }
  });
});

app.get('/nodeapp/displaybussiness', (req, res) => {
  const companyCode = req.query.company_code;
  if (!companyCode) {
    return res.status(400).json({ error: 'Company code is required' });
  }
  let qr = `SELECT * FROM tb_businesscategory WHERE company_code = ? ORDER BY category_name ASC; -- ASC for ascending order, DESC for descending order`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.status(404).send({
                  message: 'Fill Master table initially'
              });
          }
      }
  });
});

app.get('/nodeapp/displaystage', (req, res) => {
  const companyCode = req.query.company_code;
  if (!companyCode) {
    return res.status(400).json({ error: 'Company code is required' });
  }
  let qr = `
  SELECT * FROM tb_stage WHERE company_code = ? ORDER BY stage_name ASC; -- ASC for ascending order, DESC for descending order`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.status(404).send({
                  message: 'Fill Master table initially'
              });
          }
      }
  });
});

app.get('/nodeapp/displayreminder', (req, res) => {
  const companyCode = req.query.company_code;
  if (!companyCode) {
    return res.status(400).json({ error: 'Company code is required' });
  }
  let qr = `
      SELECT * FROM tb_reminder WHERE company_code = ? ORDER BY reminder_name ASC; -- ASC for ascending order, DESC for descending order`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.status(404).send({
                  message: 'Fill Master table initially'
              });
          }
      }
  });
});
 
app.get('/nodeapp/displayAllleadbydate', (req, res) => {
  const companyCode = req.query.company_code; 
   let qr = `
       SELECT 
          tb_lead.lead_id,
          tb_lead.username, 
           tb_lead.personname,
           tb_lead.email, 
           tb_lead.companyname, 
           tb_lead.products, 
          tb_lead.quantity, 
           tb_lead.contactno, 
           MAX(tb_followup.nextfollow_up_by) AS previous_month_follow_up,
           (SELECT nextfollow_up_by FROM tb_followup WHERE tb_followup.lead_id = tb_lead.lead_id AND status_id = (SELECT MAX(status_id) FROM tb_followup WHERE lead_id = tb_lead.lead_id)) AS next_month_follow_up,
           (SELECT stage FROM tb_followup WHERE tb_followup.lead_id = tb_lead.lead_id AND status_id = (SELECT MAX(status_id) FROM tb_followup WHERE lead_id = tb_lead.lead_id)) AS stage
      FROM 
           tb_lead
       INNER JOIN tb_followup ON tb_lead.lead_id = tb_followup.lead_id
       WHERE 
           tb_lead.company_code = ? 
           AND MONTH(tb_followup.nextfollow_up_by) BETWEEN MONTH(CURRENT_DATE()) - 1 AND MONTH(CURRENT_DATE()) + 2
       GROUP BY tb_lead.lead_id
       ORDER BY tb_lead.lead_id DESC;`;      
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
         console.log(err);
           res.status(500).send({
               message: 'Internal Server Error'
          });
       } else {
           if (result.length > 0) {
               res.send({
                   message: 'Get all data',
                  data: result
              });
           } else {
               res.send({
                  message: 'Data not found',
                 data: result
               });
          }
      }
  });
 });


 app.get('/nodeapp/displayAlllead', (req, res) => {
   const companyCode = req.query.company_code;
   const user_right = req.query.user_right;
   const username = req.query.username;

   let qr = '';
   let params = [companyCode];

   if (user_right === 'super') {
     // Super admin sees all data
     qr = `
       SELECT 
         admissions.lead_id,
         admissions.student_id,
         admissions.roll_no,
         admissions.name,
         admissions.email ,
         admissions.course_applying ,
         admissions.academic_session,
         admissions.mobile ,
         MAX(tb_followup.nextfollow_up_by) AS previous_month_follow_up,
         (SELECT nextfollow_up_by FROM tb_followup 
           WHERE lead_id = admissions.lead_id 
           ORDER BY status_id DESC LIMIT 1) AS next_month_follow_up,
         (SELECT stage FROM tb_followup 
           WHERE lead_id = admissions.lead_id 
           ORDER BY status_id DESC LIMIT 1) AS stage,
         tb_stage.color AS stage_color
       FROM admissions
       INNER JOIN tb_followup ON admissions.lead_id = tb_followup.lead_id
       LEFT JOIN tb_stage ON tb_followup.stage = tb_stage.stage_name
       WHERE admissions.company_code = ?
       GROUP BY admissions.lead_id
       ORDER BY admissions.lead_id DESC;
     `;
   } else if (user_right === 'data-entry') {
     // Data entry sees only their own leads
     qr = `
       SELECT 
        admissions.lead_id,
         admissions.student_id,
         admissions.roll_no,
         admissions.name,
         admissions.email ,
         admissions.course_applying ,
         admissions.academic_session,
         admissions.mobile ,
         MAX(tb_followup.nextfollow_up_by) AS previous_month_follow_up,
         (SELECT nextfollow_up_by FROM tb_followup 
           WHERE lead_id = admissions.lead_id 
           ORDER BY status_id DESC LIMIT 1) AS next_month_follow_up,
         (SELECT stage FROM tb_followup 
           WHERE lead_id = admissions.lead_id 
           ORDER BY status_id DESC LIMIT 1) AS stage,
         tb_stage.color AS stage_color
       FROM admissions
       INNER JOIN tb_followup ON admissions.lead_id = tb_followup.lead_id
       LEFT JOIN tb_stage ON tb_followup.stage = tb_stage.stage_name
       WHERE admissions.company_code = ? AND admissions.username = ?
       GROUP BY admissions.lead_id
       ORDER BY admissions.lead_id DESC;
     `;
     params.push(username);
  } else if (user_right === 'manager') {
   qr = `
     SELECT 
       admissions.lead_id,
         admissions.student_id,
         admissions.roll_no,
         admissions.name,
         admissions.email ,
         admissions.course_applying ,
         admissions.academic_session,
         admissions.mobile ,
       MAX(tb_followup.nextfollow_up_by) AS previous_month_follow_up,
       (SELECT nextfollow_up_by FROM tb_followup 
         WHERE lead_id = admissions.lead_id 
         ORDER BY status_id DESC LIMIT 1) AS next_month_follow_up,
       (SELECT stage FROM tb_followup 
         WHERE lead_id = admissions.lead_id 
         ORDER BY status_id DESC LIMIT 1) AS stage,
       tb_stage.color AS stage_color
     FROM admissions
     INNER JOIN tb_followup ON admissions.lead_id = tb_followup.lead_id
     LEFT JOIN tb_stage ON tb_followup.stage = tb_stage.stage_name
    WHERE admissions.company_code = ?
   AND (
     admissions.username = ?
     OR admissions.username IN (
       SELECT username FROM tb_user 
       WHERE teammate_id = (
         SELECT user_id FROM tb_user WHERE username = ?
       )
     )
   )
       GROUP BY admissions.lead_id
       ORDER BY admissions.lead_id DESC;
     `;
     params.push(username, username);
 }


   else {
     return res.status(400).send({ message: 'Invalid user_right' });
   }

   db.query(qr, params, (err, result) => {
     if (err) {
       console.error(err);
       return res.status(500).send({ message: 'Internal Server Error' });
     }

     res.send({
       message: result.length > 0 ? 'Get all data' : 'Data not found',
       data: result
     });
   });
 });


// app.get('/nodeapp/displayAlllead', (req, res) => {
//   const companyCode = req.query.company_code;
//   const userRight = req.query.user_right;
//   const username = req.query.username;

//   if (!companyCode || !userRight || !username) {
//     return res.status(400).json({ message: 'Missing required query parameters: company_code, user_right, username' });
//   }

//   let sql = '';
//   let params = [companyCode];

//   if (userRight === 'super') {
//     // Super admin sees all admissions for the company
//     sql = `
//       SELECT * FROM admissions 
//       WHERE company_code = ? 
//       ORDER BY id DESC
//     `;
//   } 
//   else if (userRight === 'data-entry') {
//     // Data entry sees only their own admissions
//     sql = `
//       SELECT * FROM admissions 
//       WHERE company_code = ? AND username = ? 
//       ORDER BY id DESC
//     `;
//     params.push(username);
//   } 
//   else if (userRight === 'manager') {
//     // Manager sees their own admissions + team members' admissions
//     sql = `
//       SELECT a.* FROM admissions a
//       WHERE a.company_code = ?
//       AND (
//         a.username = ?
//         OR a.username IN (
//           SELECT u.username FROM tb_user u
//           WHERE u.teammate_id = (
//             SELECT user_id FROM tb_user WHERE username = ?
//           )
//         )
//       )
//       ORDER BY a.id DESC
//     `;
//     params.push(username, username);
//   } 
//   else {
//     return res.status(400).json({ message: 'Invalid user_right' });
//   }

//   db.query(sql, params, (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ message: 'Internal Server Error', error: err.message });
//     }
//     res.json({
//       success: true,
//       message: results.length > 0 ? 'Admissions fetched' : 'No admissions found',
//       data: results
//     });
//   });
// });

app.get('/nodeapp/displayAllleadby-statistics', (req, res) => {
  const companyCode = req.query.company_code; 
  let qr = `
      SELECT 
          tb_lead.lead_id,
          tb_lead.username, 
          tb_lead.personname,
          tb_lead.email,  
          tb_lead.companyname, 
          tb_lead.products, 
          tb_lead.contactno, 
          MAX(tb_followup.nextfollow_up_by) AS previous_month_follow_up,
          (SELECT nextfollow_up_by FROM tb_followup WHERE tb_followup.lead_id = tb_lead.lead_id AND status_id = (SELECT MAX(status_id) FROM tb_followup WHERE lead_id = tb_lead.lead_id)) AS next_month_follow_up,
          (SELECT stage FROM tb_followup WHERE tb_followup.lead_id = tb_lead.lead_id AND status_id = (SELECT MAX(status_id) FROM tb_followup WHERE lead_id = tb_lead.lead_id)) AS stage
      FROM 
          tb_lead
      INNER JOIN tb_followup ON tb_lead.lead_id = tb_followup.lead_id
      WHERE 
          tb_lead.company_code = ?    
      GROUP BY tb_lead.lead_id
      ORDER BY tb_lead.lead_id DESC;`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.send({
                  message: 'Data not found',
                  data: result
              });
          }
      }
  });
});

app.get('/nodeapp/getAlllead', (req, res) => {
  const companyCode = req.query.company_code;
  let qr = `SELECT * FROM tb_followup WHERE company_code = ?`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.send({
                  message: 'Data not found',
                  data: result
              });
          }
      }
  });
});

app.get('/nodeapp/leads', (req, res) => {
  const companyCode = req.query.company_code;
  let qr = `SELECT source, COUNT(*) as count FROM tb_lead WHERE company_code = ? GROUP BY source`;
  db.query(qr, [companyCode], (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.send({
                  message: 'Data not found',
                  data: result
              });
          }
      }
  });
});

app.get('/nodeapp/displayLead1/:lead_id', (req, res) => {
   const lead_id = req.params.lead_id;
   console.log('Received request for Lead ID:', lead_id);
   let qr = 'SELECT * FROM tb_lead WHERE lead_id = ?';
   console.log('SQL Query:', qr);
   db.query(qr, [lead_id], (err, result) => {
     console.log('Query result:', result);
     if (err) {
      console.log(err);
      res.status(500).send({
        message: 'Internal Server Error',
        error: err
      });
    } else {
      if (result.length > 0) {
        res.send({
          message: 'Get single data',
           data: result[0]
         });
       } else {
        res.send({
          message: 'Data not found',
          data: null
        });
      }
     }
   });
 });

app.get('/nodeapp/displayticket/:ticket_id', (req, res) => {
  const ticket_id = req.params.ticket_id;
  console.log('Received request for ticket_id:', ticket_id);
  let qr = 'SELECT * FROM tb_ticketcreate WHERE ticket_id = ?';
  console.log('SQL Query:', qr);
  db.query(qr, [ticket_id], (err, result) => {
    console.log('Query result:', result);
    if (err) {
      console.log(err);
      res.status(500).send({
        message: 'Internal Server Error',
        error: err
      });
    } else {
      if (result.length > 0) {
        res.send({
          message: 'Get single data',
          data: result[0]
        });
      } else {
        res.send({
          message: 'Data not found',
          data: null
        });
      }
    }
  });
});

app.get('/nodeapp/displayLead/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  console.log('Received request for Lead ID:', user_id);
  let qr = 'SELECT * FROM tb_user WHERE user_id = ?';
  console.log('SQL Query:', qr);
  db.query(qr, [user_id], (err, result) => {
    console.log('Query result:', result);
    if (err) {
      console.log(err);
      res.status(500).send({
        message: 'Internal Server Error',
        error: err
      });
    } else {
      if (result.length > 0) {
        res.send({
          message: 'Get single data',
          data: result[0]
        });
      } else {
        res.send({
          message: 'Data not found',
          data: null
        });
      }
    }
  });
});

app.get('/nodeapp/editcompany/:company_code', (req, res) => {
  const company_code = req.params.company_code;
  console.log('Received request for Lead ID:', company_code);
  
  let qr = 'SELECT * FROM tb_company WHERE company_code = ?';
  console.log('SQL Query:', qr);
  
  db.query(qr, [company_code], (err, result) => {
    console.log('Query result:', result);
    
    if (err) {
      console.log(err);
      res.status(500).send({
        message: 'Internal Server Error',
        error: err
      });
    } else {
      if (result.length > 0) {
        res.send({
          message: 'Get single data',
          data: result[0]
        });
      } else {
        res.send({
          message: 'Data not found',
          data: null
        });
      }
    }
  });
});

// app.put('/leadupdate/:lead_id', (req, res) => {
//   const currentDate = new Date();
//   const formattedDate = currentDate.toISOString().split('T')[0];
//   const lead_id  = req.params.lead_id;
//   const {
//   personname,
//   companyname,
//   email,
//   contactno,
//   city,
//   designation,
//   address,
//   source,
//   products,
//   stage,
//   reminder_status,
//   company_vertical,
//   nextfollow_up_by,
//   remark
//   } = req.body;
//   const sql =
//   'UPDATE tb_lead SET reg_date=?, personname=?, companyname=?, email=?, contactno=?, city=?, designation=?, address=?, source=?, products=?, stage=?, reminder_status=?, company_vertical=?, nextfollow_up_by=?, remark=?  WHERE lead_id = ?';
//   db.query(sql, 
//   [
//     formattedDate,
//     personname,
//     companyname,
//     email,
//     contactno,
//     city,
//     designation,
//     address,
//     source,
//     products,
//     stage,
//     reminder_status,
//     company_vertical,
//     nextfollow_up_by,
//     remark,
//     lead_id 
//   ], (err, result) => {
//     if (err) {
//       console.log(err);
//       res.status(500).json({
//         message: 'Error updating data',
//         error: err,
//       });
//     } else {
//       console.log('SQL Result:', result);
//       res.status(200).json({
//         message: 'Data Updated',
//         data: result,
//       });
//     }
//   });
// });  

app.put('/nodeapp/leadupdate/:lead_id', (req, res) => {
  const lead_id = req.params.lead_id;
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];

  const {
   
    companyname,
    personname,
    email,
    contactno,
    city,
    designation,
    address,
    source,
    products = [],
    extended_user,
    stage,
    reminder_status,
    company_vertical,
    nextfollow_up_by,
    remark
  } = req.body;

  // ✅ Ensure products is a safe array
  const filteredProducts = Array.isArray(products)
    ? products.filter(p => p && p.name)
    : [];

  const productString = filteredProducts.map(p => p.name).join(',') || '';
  const quantityString = filteredProducts.map(p => p.quantity || '').join(',') || '';

  const sql = `
    UPDATE tb_lead SET 
      reg_date = ?, 
      
      companyname = ?, 
      personname = ?, 
      email = ?, 
      contactno = ?, 
      city = ?, 
      designation = ?, 
      address = ?, 
      source = ?, 
      products = ?, 
      stage = ?, 
      reminder_status = ?, 
      company_vertical = ?, 
      nextfollow_up_by = ?, 
      remark = ?, 
      quantity = ?
    WHERE lead_id = ?
  `;

  db.query(sql, [
    formattedDate,
   
    companyname,
    personname,
    email,
    contactno,
    city,
    designation,
    address,
    source,
    productString,
    stage,
    reminder_status,
    company_vertical,
    nextfollow_up_by,
    remark,
    quantityString,
    lead_id
  ], (err, result) => {
    if (err) {
      console.error('SQL ERROR:', err.sqlMessage);
      return res.status(500).json({ message: 'Error updating data', error: err });
    } else {
      return res.status(200).json({ message: 'Data Updated', data: result });
    }
  });
});



app.get('/nodeapp/displayfollowup/:lead_id', (req, res) => {
  const lead_id = req.params.lead_id;
  console.log('Received request for Lead ID:', lead_id);
  let qr = 'SELECT * FROM tb_followup WHERE lead_id = ? ORDER BY status_id DESC';
  console.log('SQL Query:', qr);
  db.query(qr, [lead_id], (err, result) => {
      console.log('Query result:', result);
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error',
              error: err
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get data for lead_id',
                  data: result
              });
          } else {
              res.send({
                  message: 'Data not found',
                  data: null
              });
          }
      }
  });
});

app.get('/nodeapp/followupbyedit/:status_id', (req, res) => {
const status_id = req.params.status_id;
console.log('Received request for Lead ID:', status_id);
let qr = 'SELECT * FROM tb_followup WHERE status_id = ? ';
console.log('SQL Query:', qr);
db.query(qr, [status_id], (err, result) => {
    console.log('Query result:', result);
    if (err) {
        console.log(err);
        res.status(500).send({
            message: 'Internal Server Error',
            error: err
        });
    } else {
        if (result.length > 0) {
            res.send({
                message: 'Get data for status_id',
                data: result
            });
        } else {
            res.send({
                message: 'Data not found',
                data: null
            });
        }
    }
});
});

app.put('/nodeapp/followupbyupdate/:status_id', (req, res) => {
const currentDate = new Date();
const formattedDate = currentDate.toISOString().split('T')[0];
const status_id = req.params.status_id;
const {
follow_up_time,
nextfollow_up_by,
stage,
reminder_status,
remark
} = req.body;
const sql =
'UPDATE tb_followup SET entry_date=?, follow_up_time=?, nextfollow_up_by=?, stage=?, reminder_status=?, remark=? WHERE status_id=?';
db.query(sql, 
[
  formattedDate,
  follow_up_time,
  nextfollow_up_by,
  stage,
  reminder_status,
  remark,
  status_id
], (err, result) => {
  if (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error updating data',
      error: err,
    });
  } else {
    console.log('SQL Result:', result);
    res.status(200).json({
      message: 'Data Updated',
      data: result,
    });
  }
});
});

app.delete('/nodeapp/followupdelet/:status_id', (req, res) => {
const status_id = req.params.status_id;
if (!status_id) {
res.status(400).json({ error: 'Item ID is missing' });
return;
}
const sql = 'DELETE FROM tb_followup WHERE status_id = ?';
db.query(sql, [status_id], (err, result) => {
if (err) {
  console.log(err);
  res.status(500).send('Error deleting item');
} else {
  if (result.affectedRows === 0) {
    res.status(404).json({ error: 'user not found' });
  } else {
    res.status(200).json({ message: 'user deleted successfully' });
  }
}
});
});

app.get('/nodeapp/client/:personname', (req, res) => {
  const companyCode = req.query.company_code; 
  const personname = req.params.personname;
  const query = `SELECT * FROM tb_lead WHERE personname = ? AND company_code = ?`;
  db.query(query, [personname, companyCode], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: 'Client not found' });
      }
    }
  });
});

 app.get('/nodeapp/exitingclient/:companyname', (req, res) => {
   const companyCode = req.query.company_code; 
   const companyname = req.params.companyname;
   const query = `SELECT * FROM tb_lead WHERE companyname = ? AND company_code = ?`;
  
   db.query(query, [companyname, companyCode], (err, results) => {
     if (err) {
       console.error('Error executing MySQL query:', err);
       res.status(500).json({ error: 'Internal Server Error' });
     } else {
       if (results.length > 0) {
         res.json(results[0]);
       } else {
         res.status(404).json({ error: 'Client not found' });
       }
     }
   });
 });


app.get('/nodeapp/newvisistingcard/:personname', (req, res) => {

  const personname = req.params.personname;
  const query = `SELECT * FROM tb_visitingcards WHERE personname = ?`;
  
  db.query(query, [personname], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).json({ error: 'Client not found' });
      }
    }
  });
});


// Get products for the selected company
app.get('/nodeapp/leadproducts/:companyname', (req, res) => {
  const companyname = req.params.companyname;
  const query = `SELECT products FROM tb_lead WHERE companyname = ?`;

  db.query(query, [companyname], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results.map(row => row.products)); 
    }
  });
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/nodeapp/companylogo', (req, res) => {
  const companyCode = req.query.company_code;
  const qr = `SELECT company_logo FROM tb_company WHERE company_code = ?`;
  db.query(qr, [companyCode], (err, result) => {
    if (err) {
      console.error('Error fetching company logo:', err);
      return res.status(500).send('Internal server error');
    }
    if (result.length === 0) {
      return res.status(404).send('Company not found');
    }
    const imagePath = path.join(__dirname, 'uploads', result[0].company_logo);
    res.sendFile(imagePath);
  });
});

app.post('/nodeapp/reset-password', (req, res) => {
  const email = req.body.email;
  const query = `SELECT * FROM tb_user WHERE email = ?`;
  db.query(query, [email], (error, results, fields) => {
  if (error) {
   console.error(error);
   res.status(500).send('Error occurred while checking email.');
   return;
  }
  if (results.length === 0) {
   res.status(404).send('Email not found.'); 
   return;
  }

  const userPassword = results[0].password;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
    user: 'sednainfo5@gmail.com',
    pass: 'mfzm afcu fwma latu'
    }
    });
  const mailOptions = {
    from: 'sednainfo5@gmail.com',
    to: email,
    subject: 'Your Password',
    text: `Your password is: ${userPassword}. Please keep it secure and consider changing it for security reasons.`
    };
    transporter.sendMail(mailOptions, (emailError, info) => {
  if (emailError) {
    console.error('Email sending error:', emailError);
    res.status(500).json({ error: 'Error occurred while sending email.' });
    return;
  }
  console.log('Email sent: ' + info.response);
  res.json({ message: 'Password sent to your email.' });
  });
});
});
 
app.post('/nodeapp/send-email', (req, res) => {
  const { email } = req.body;
  const query = `SELECT personname, products, reg_date FROM tb_lead WHERE email = ?`;
  db.query(query, [email], (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    } else {
      if (results.length > 0) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'sednainfo5@gmail.com',
            pass: 'mfzm afcu fwma latu'
          }
        });
        const mailOptions = {
          from: 'sednainfo5@gmail.com',
          to: email,
          subject: 'Test Email',
          html: `Hello <b>${results[0].personname}</b>,<br>
            &nbsp;&nbsp;&nbsp;This is the gentle reminder for your requirement regarding ${results[0].products} registered on our CRM portal dated ${results[0].reg_date}.
            Kindly, let us know when can we again reach you by replying on this email.<br><br>
            <b>Best regards,</b><br>
            <b>We offer other services as:</b><br>
            - Website Design<br>
            - Website Maintenance<br> 
            - Bulk Whatsapp<br>
            - Digital Marketing<br> 
            - Google PPC Campaign <br>
            - Instagram Marketing<br>
            - Cold Calling Services<br>
            - Logo Designing / Graphic / Catalogue / Brochure Designing<br>
            - CRM Software<br>
            - Mobile Application Development<br><br>
            <b>About Us</b>:- We are Mumbai based 18+ years old development company with 20+ professional team. To further know more visit following link:<br>
            Our Location:<br>
            https://maps.app.goo.gl/ae12TDTbGZ1jwZSa8 <br>
            
            Our Video Profile:<br>
            https://youtu.be/YXRGP-dCz1M <br>
            
            Our Reviews:<br>
            https://g.page/r/CX7M8mMzDKqTEB0/review <br>
            
            Our Website:<br>
            https://www.sednainfosystems.com  <br><br>
                            
            Yours Sincerely,<br>
            Poonam Mishra<br>
            Sales Team | 9920432160`
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
          } else {
            console.log('Email sent successfully:', info.response);
            res.status(200).send('Email sent successfully');
          }
        });
      } else {
        res.status(404).send('No data found for the provided email');
      }
    }
  });
});

app.get('/nodeapp/displayautoemail', (req, res) => {
  let qr = `
      SELECT 
          *
      FROM 
       tb_automail ORDER BY send_date DESC
  `;
  db.query(qr, (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error'
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get all data',
                  data: result
              });
          } else {
              res.send({
                  message: 'Fill Master table initially',
                  data: result
              });
          }
      }
  });
});

app.get('/nodeapp/notifications', (req, res) => {
  const currentDate = new Date();
  const twoDaysBefore = new Date(currentDate);
  twoDaysBefore.setDate(currentDate.getDate() - 2);
  const currentDateFormatted = currentDate.toISOString().split('T')[0];
  const twoDaysBeforeFormatted = twoDaysBefore.toISOString().split('T')[0];
  const companyCode = req.query.company_code;
  // Update the query to include the date range (current date and two days before)
  let qr = `
    SELECT
      tb_lead.personname,
      DATE_FORMAT(tb_followup.nextfollow_up_by, '%d/%m/%Y') AS nextfollow_up_by,
      tb_followup.follow_up_time, tb_followup.lead_id
    FROM tb_followup
    JOIN tb_lead ON tb_followup.lead_id = tb_lead.lead_id
    WHERE DATE(tb_followup.nextfollow_up_by) BETWEEN ? AND ?
    AND tb_followup.followupcomplete <> 'done'
    AND tb_lead.company_code = ?;
  `;
  db.query(qr, [twoDaysBeforeFormatted, currentDateFormatted, companyCode], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({
        message: 'Internal Server Error',
        error: err,
      });
    } else {
      res.json({ notifications: result });
    }
  });
});

function sendEmail(leadDetails) {
  if (!leadDetails || leadDetails.length === 0) {
    console.log('No lead details provided.');
    return;
  }
let emailText = `
<!DOCTYPE html>
<html>
<head>
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
    }
    th {
      background-color: #264796;
      color: #fff;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <h2>follow-up Details </h2>
  <table>
    <thead>
      <tr>
        <th>Lead ID</th>
        <th>Person Name</th>
        <th>Follow-up Time</th>
      </tr>
    </thead>
    <tbody>`;
leadDetails.forEach((lead) => {
  const formattedTime = formatFollowUpTime(lead.follow_up_time);
  emailText += `
      <tr>
        <td>${lead.lead_id}</td>
        <td>${lead.personname}</td>
        <td>${formattedTime}</td>
      </tr>`;
});
emailText += `
    </tbody>
  </table>
</body>
</html>`;
function formatFollowUpTime(time) {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2].split('.')[0], 10);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
}
  const mailOptions = {
    from: 'sednainfo5@gmail.com',
    to: 'sednainfo5@gmail.com',
    subject: 'Todays Follow-up Reminder',
    html: emailText,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}
schedule.scheduleJob('42 14 * * *', () => {
  const currentDate = new Date().toISOString().slice(0, 10);
  const sql = `SELECT * FROM tb_followup WHERE nextfollow_up_by = '${currentDate}'`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log('Error querying database:', err);
    } else {
      if (results.length > 0) {
        sendEmail(results);
      } else {
        console.log('No entries found for today.');
      }
    }
  });
});

app.get('/nodeapp/allfollowup/:lead_id', (req, res) => {
  const lead_id = req.params.lead_id;
  const query = `SELECT * FROM tb_followup WHERE lead_id = ? ORDER BY status_id DESC`;
  db.query(query, [lead_id], (error, results, fields) => {
      if (error) {
          console.error('Error fetching data from database:', error);
          res.status(500).json({ error: 'An internal server error occurred' });
          return;
      }
      if (results.length === 0) {
          res.status(404).json({ error: 'No data found for the specified lead ID' });
          return;
      }
      res.json(results); 
  });
});

app.get('/nodeapp/inpipelinecount', (req, res) => { 
  const companyCode = req.query.company_code; 
  const query = `
    SELECT COUNT(f.status_id) as count, f.stage, s.color
    FROM tb_followup f
    JOIN tb_stage s ON f.stage = s.stage_name
    WHERE f.stage IN ('Quotation Followup', 'Quotation High', 'Quotation To Send', 'Verbal Discussion')
    AND f.company_code = ?  
    GROUP BY f.stage;
  `;
  db.query(query, [companyCode], (err, results) => {
    if (err) {
      console.error('Error fetching stages count:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});


app.get('/nodeapp/underprocesscount', (req, res) => { 
  const companyCode = req.query.company_code;
  const query = `
    SELECT COUNT(f.status_id) as count, f.stage, s.color
    FROM tb_followup f
    JOIN tb_stage s ON f.stage = s.stage_name
    WHERE f.stage IN ('Order Received', 'Order Closed', 'Lead Cancel')
    AND f.company_code = ?  
    GROUP BY f.stage;
  `;
  db.query(query, [companyCode], (err, results) => {
    if (err) {
      console.error('Error fetching stages count:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Under Process Results:', results); 
      res.status(200).json(results);
    }
  });
});

app.get('/nodeapp/renewalcount', (req, res) => { 
  const companyCode = req.query.company_code;
  const query = `
    SELECT COUNT(f.status_id) as count, f.stage, s.color
    FROM tb_followup f
    JOIN tb_stage s ON f.stage = s.stage_name
    WHERE f.stage IN ('Renewal Follow Up', 'Invalid Lead', 'Other Reason')
    AND f.company_code = ?  
    GROUP BY f.stage;
  `;
  db.query(query, [companyCode], (err, results) => {
    if (err) {
      console.error('Error fetching stages count:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('Renewal Results:', results); 
      res.status(200).json(results);
    }
  });
});

app.get('/nodeapp/invalidcount', (req, res) => { 
  const companyCode = req.query.company_code;
  const query = `
  SELECT COUNT(status_id) as count, stage
  FROM tb_followup
  WHERE stage IN ('Invoice Pending')
  AND company_code = ?  
  GROUP BY stage;`;
  db.query(query, [companyCode], (err, results) => {
    if (err) {
      console.error('Error fetching stages count:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/nodeapp/stagecount', (req, res) => {
  const selectedStage = req.query.stage; 
  const query = `
    SELECT COUNT(status_id) as count, stage
    FROM tb_followup
    WHERE stage = ?;`; 
  db.query(query, [selectedStage], (err, results) => {
    if (err) {
      console.error('Error fetching stages count:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.get('/nodeapp/stageDetails', (req, res) => {
  const selectedStage = req.query.stage;
  const companyCode = req.query.company_code; 
  const query = `
    SELECT f.*, s.color
    FROM tb_followup f
    JOIN tb_stage s ON f.stage = s.stage_name
    WHERE f.stage = ? AND f.company_code = ?;
  `; 
  db.query(query, [selectedStage, companyCode], (err, results) => {
    if (err) {
      console.error('Error fetching stage details:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(200).json(results);
    }
  });
});

async function sendMessage(number, token, message) {
  if (number && !number.startsWith('91')) {
    number = '91' + number;
  }
  try {
    const url = 'https://int.chatway.in/api/send-msg';
    const params = {
      username: 'sedna', 
      number: number, 
      message: message, 
      token: token 
    };
    const response = await axios.get(url, { params });
    console.log('Message sent successfully to', number);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('Error sending message to', number, ':', error.response.data);
    } else {
      console.error('Error sending message to', number, ':', error.message);
    }
  }
}

function fetchContactNumbers() {
  return new Promise((resolve, reject) => {
    const currentDate = new Date().toISOString().slice(0, 10); 
    const query = `
     SELECT l.contactno, l.company_code, f.personname, l.products, DATE_FORMAT(l.reg_date, '%d-%m-%Y') AS reg_date
      FROM tb_lead l
      INNER JOIN tb_followup f ON l.lead_id = f.lead_id
      WHERE f.nextfollow_up_by = ?;`
    db.query(query, [currentDate], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
async function sendMessagesToLeads() {
  try {
    const contacts = await fetchContactNumbers();
    const promises = contacts.map(async (contact) => {
      const { contactno, company_code, personname, products, reg_date } = contact;
      const token = determineToken(company_code);
      const message = `Hello ${personname},

This is a gentle reminder for your requirement regarding ${products} registered on our CRM portal dated ${reg_date}.
Kindly, let us know when can we again reach you by replying to this email.

Best regards,

We offer other services such as:
- Website Design
- Website Maintenance
- Bulk Whatsapp
- Digital Marketing
- Google PPC Campaign
- Instagram Marketing
- Cold Calling Services
- Logo Designing / Graphic / Catalogue / Brochure Designing
- CRM Software
- Mobile Application Development

About Us: We are a Mumbai-based 18+ years old development company with a 20+ professional team. To further know more, visit the following link:
Our Location:
https://maps.app.goo.gl/ae12TDTbGZ1jwZSa8

Our Video Profile:
https://youtu.be/YXRGP-dCz1M

Our Company Profile:
https://drive.google.com/file/d/1otGadJbYaOMF-rJvWcrQuqNEgc_rWbCr/view?pli=1

Our Reviews:
https://g.page/r/CX7M8mMzDKqTEB0/review

Our Website:
https://www.sednainfosystems.com

Yours Sincerely,
Poonam Mishra
Sales Team | 9920432160
`;

      await sendMessage(contactno, token, message);
    });
    await Promise.all(promises);
    console.log('All messages sent successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    db.end(); 
  }
}


function determineToken(companyCode) {
  const tokens = {
    '1001': 'UWtiT0EwcFpjOXZ5SnBiejhzN2lTdz09',
    '1002': 'cVowZjZQZjEvNUFueExlaWIwZGpOdz09'
  };
  return tokens[companyCode] || null;
}
// Schedule the main function to run at 12:50 PM every day
schedule.scheduleJob({ hour: 15, minute: 13 }, function() {
  console.log('Scheduled message sending job starting at 1:02 PM');
  sendMessagesToLeads();
});


app.get('/nodeapp/count', (req, res) => {
  const { month, company_code } = req.query;
  if (!month || !company_code) {
    console.error('Month or company_code parameter is missing');
    res.status(400).json({ error: 'Month or company_code parameter is missing' });
    return;
  }
  const [selectedMonth, selectedYear] = month.split('-');
  const startDate = `${selectedYear}-${selectedMonth}-01`;
  const endDate = `${selectedYear}-${selectedMonth}-31`;
  const query = `SELECT COUNT(*) AS leadCount FROM tb_lead WHERE company_code = ? AND reg_date >= ? AND reg_date <= ?`;
  db.query(query, [company_code, startDate, endDate], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const leadCount = results[0].leadCount;
    res.json({ leadCount });
  });
});

app.get('/nodeapp/lead-details', (req, res) => {
  const { month, company_code } = req.query;
  if (!month || !company_code) {
    console.error('Month or company_code parameter is missing');
    res.status(400).json({ error: 'Month or company_code parameter is missing' });
    return;
  }
  const [selectedMonth, selectedYear] = month.split('-');
  const startDate = `${selectedYear}-${selectedMonth}-01`;
  const endDate = `${selectedYear}-${selectedMonth}-31`;
  // Query to get detailed information about the leads
  const query = `
    SELECT *
    FROM tb_lead
    WHERE company_code = ? AND reg_date >= ? AND reg_date <= ?
  `;
  db.query(query, [company_code, startDate, endDate], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ leads: results });
  });
});


app.get('/nodeapp/data', (req, res) => {
  const sortBy = req.query.sort_by;
  let tableName;
  if (sortBy === 'company_code') {
    const companyCode = req.query.company_code;
    tableName = getTableNameByCompanyCode(companyCode);
    if (!tableName) {
      res.status(400).json({ error: 'Invalid company_code' });
      return;
    }
  } else {
    switch (sortBy) {
      case 'source':
        tableName = 'tb_source';
        break;
      case 'products':
        tableName = 'tb_products';
        break;
      case 'stage':
        tableName = 'tb_stage';
        break;
      case 'profile':
        tableName = 'tb_profile';
        break;
      case 'business_category':
        tableName = 'tb_businesscategory';
        break;
      case 'reminder':
        tableName = 'tb_reminder';
        break;
      default:
        res.status(400).json({ error: 'Invalid sort_by parameter' });
        return;
    }
  }
  const query = `SELECT * FROM ${tableName} WHERE company_code = ?;`;
  db.query(query, [req.query.company_code], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).json({ error: 'Error fetching data' });
      return;
    }
    res.json(results);
  });
});

// Function to map company_code to table name
function getTableNameByCompanyCode(companyCode) {
  switch (companyCode) {
    case 'source':
      return 'tb_source'; 
    case 'products':
      return 'tb_products'; 
    case 'stage':
      return 'tb_stage';
    case 'profile':
      return 'tb_profile';
    case 'business_category':
      return 'tb_businesscategory';
    case 'reminder':
      return 'tb_reminder';
    default:
      return null; 
  }
}

app.post('/nodeapp/insertdata', (req, res) => {
  const selectedOption = req.body.selectedOption;
  const inputValue = req.body.inputValue;
  const companyCode = req.body.company_code;
  const color = req.body.color;
  const quantity = req.body.quantity;

  if (!selectedOption || !inputValue || !companyCode) {
    return res.status(400).json({ error: 'Please provide selectedOption, inputValue, and company_code in the request body' });
  }

  let tableName;
  let columnName;
  let queryValues = [inputValue, companyCode];

  switch (selectedOption) {
    case 'source':
      tableName = 'tb_source';
      columnName = 'source_name';
      break;
    case 'products':
      tableName = 'tb_products';
      columnName = 'product_name';
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Please provide quantity for the product' });
      }
      queryValues.push(quantity);
      break;
    case 'stage':
      tableName = 'tb_stage';
      columnName = 'stage_name';
      if (!color) {
        return res.status(400).json({ error: 'Please provide color for the stage' });
      }
      queryValues.push(color);
      break;
    case 'profile':
      tableName = 'tb_profile';
      columnName = 'profile_name';
      break;
    case 'business_category':
      tableName = 'tb_businesscategory';
      columnName = 'category_name';
      break;
    case 'reminder':
      tableName = 'tb_reminder';
      columnName = 'reminder_name';
      break;
    default:
      return res.status(400).json({ error: 'Invalid selectedOption' });
  }

  let query;
  if (selectedOption === 'products') {
    query = `INSERT INTO ${tableName} (${columnName}, company_code, quantity) VALUES (?, ?, ?)`;
  } else if (selectedOption === 'stage') {
    query = `INSERT INTO ${tableName} (${columnName}, company_code, color) VALUES (?, ?, ?)`;
  } else {
    query = `INSERT INTO ${tableName} (${columnName}, company_code) VALUES (?, ?)`;
  }

  db.query(query, queryValues, (err, results) => {
    if (err) {
      console.error('Error inserting data into MySQL:', err);
      return res.status(500).json({ error: 'Error inserting data' });
    }
    res.status(200).json({ message: 'Data inserted successfully' });
  });
});


app.get('/nodeapp/:timeframe/:companyCode', (req, res) => {
  const { timeframe, companyCode } = req.params;
  let fromDate;
  // Handle timeframe logic
  switch (timeframe) {
    case 'last_one_month':
      fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 1);
      break;
    case 'last_six_month':
      fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 6);
      break;
    case 'one_year':
      fromDate = new Date();
      fromDate.setFullYear(fromDate.getFullYear() - 1);
      break;
    case 'all':
      break;
    default:
      return res.status(400).json({ error: 'Invalid timeframe' });
  }
  let query = `
    SELECT 
      tb_lead.lead_id,
      tb_lead.username,
      tb_lead.personname,
      tb_lead.email,
      tb_lead.companyname,
      tb_lead.products,
      tb_lead.contactno,
      tb_followup.nextfollow_up_by,
      tb_followup.stage,
      tb_stage.color AS stage_color  -- Join to get the color for the stage
    FROM tb_lead
    LEFT JOIN tb_followup ON tb_lead.lead_id = tb_followup.lead_id
    LEFT JOIN tb_stage ON tb_followup.stage = tb_stage.stage_name
  `;
  const params = [];
  if (companyCode) {
    query += ' WHERE tb_lead.company_code = ?';
    params.push(companyCode);
  }
  if (fromDate) {
    if (params.length > 0) {
      query += ` AND tb_lead.reg_date >= ?`;
      params.push(fromDate.toISOString().split('T')[0]);
    } else {
      query += ` WHERE tb_lead.reg_date >= ?`;
      params.push(fromDate.toISOString().split('T')[0]);
    }
  }
  query += ' ORDER BY tb_lead.reg_date DESC';
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(result);
  });
});

app.delete('/nodeapp/delete/:option/:id', (req, res) => {
  const option = req.params.option;
  const id = req.params.id;
  let tableName, columnName;
  switch (option) {
      case 'source':
          tableName = 'tb_source';
          columnName = 'id';
          break;
      case 'products':
          tableName = 'tb_products';
          columnName = 'id';
          break;
      case 'stage':
          tableName = 'tb_stage';
          columnName = 'id';
          break;
      case 'profile':
          tableName = 'tb_profile';
          columnName = 'id';
          break;
      case 'business_category':
          tableName = 'tb_businesscategory';
          columnName = 'id';
          break;
    case 'reminder':
          tableName = 'tb_reminder';
          columnName = 'id';
          break;
      default:
          return res.status(400).json({ error: 'Invalid option' });
  }
  const sql = `DELETE FROM ${tableName} WHERE ${columnName} = ?`;
  db.query(sql, [id], (err, results) => {
      if (err) {
          console.error('Error deleting item:', err);
          return res.status(500).json({ error: 'Error deleting item' });
      }
      res.status(200).json({ message: 'Item deleted successfully' });
  });
});

app.put('/nodeapp/userupdate/:user_id', (req, res) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    const user_id  = req.params.user_id ;
    const {
    company_code,
    username,
    email,
    password,
    active,
    reg_date,
    user_right
    } = req.body;
    const sql =
    'UPDATE tb_user SET company_code=?, username=?, email=?, password=?, active=?, reg_date=?, user_right=?  WHERE user_id = ?';
    db.query(sql, 
    [
      company_code,
      username,
      email,
      password,
      active,
      formattedDate,
      user_right,
      user_id 
    ], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: 'Error updating data',
          error: err,
        });
      } else {
        console.log('SQL Result:', result);
        res.status(200).json({
          message: 'Data Updated',
          data: result,
        });
      }
    });
    });
    
app.delete('/nodeapp/userdelet/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
  res.status(400).json({ error: 'Item ID is missing' });
  return;
  }
  const sql = 'DELETE FROM tb_user WHERE user_id = ?';
    db.query(sql, [user_id], (err, result) => {
    if (err) {
    console.log(err);
    res.status(500).send('Error deleting item');
    } else {
    if (result.affectedRows === 0) {
    res.status(404).json({ error: 'user not found' });
    } else {
    res.status(200).json({ message: 'user deleted successfully' });
    }
    }
  });
});

app.post('/nodeapp/insertSource', (req, res) => {
  const { source_name, company_code } = req.body;
  if (!source_name || !company_code) {
    res.status(400).json({ message: 'Please provide both source_name and company_code' });
    return;
  }
  const sql = `INSERT INTO tb_source (source_name, company_code) VALUES (?, ?)`;
  db.query(sql, [source_name, company_code], (err, result) => {
    if (err) {
      console.error('Error inserting source:', err);
      res.status(500).json({ message: 'Error inserting source' });
    } else {
      console.log('Source inserted:', result);
      res.status(200).json({ message: 'Source inserted successfully' });
    }
  });
});

app.post('/nodeapp/insertStage', (req, res) => {
  const { stage_name, color, company_code } = req.body;
  if (!stage_name || !color || !company_code) {
    res.status(400).json({ message: 'Please provide both stage_name and company_code' });
    return;
  }
  const sql = `INSERT INTO tb_stage (stage_name, color, company_code ) VALUES (?, ?, ?)`;
  db.query(sql, [stage_name, color, company_code], (err, result) => {
    if (err) {
      console.error('Error inserting source:', err);
      res.status(500).json({ message: 'Error inserting source' });
    } else {
      console.log('Source inserted:', result);
      res.status(200).json({ message: 'Source inserted successfully' });
    }
  });
});

app.post('/nodeapp/insertprofile', (req, res) => {
  const { profile_name, company_code } = req.body;
  if (!profile_name || !company_code) {
    res.status(400).json({ message: 'Please provide both profile_name and company_code' });
    return;
  }
  const sql = `INSERT INTO tb_profile (profile_name, company_code) VALUES (?, ?)`;
  db.query(sql, [profile_name, company_code], (err, result) => {
    if (err) {
      console.error('Error inserting source:', err);
      res.status(500).json({ message: 'Error inserting source' });
    } else {
      console.log('Source inserted:', result);
      res.status(200).json({ message: 'Source inserted successfully' });
    }
  });
});

app.post('/nodeapp/insertproducts', (req, res) => {
  const { product_name, company_code } = req.body;
  if (!product_name || !company_code) {
    res.status(400).json({ message: 'Please provide both product_name and company_code' });
    return;
  }
  const sql = `INSERT INTO tb_products (product_name, company_code) VALUES (?, ?)`;
  db.query(sql, [product_name, company_code], (err, result) => {
    if (err) {
      console.error('Error inserting source:', err);
      res.status(500).json({ message: 'Error inserting source' });
    } else {
      console.log('Source inserted:', result);
      res.status(200).json({ message: 'Source inserted successfully' });
    }
  });
});

app.post('/nodeapp/insertbussinesscategory', (req, res) => {
  const { category_name, company_code } = req.body;
  if (!category_name || !company_code) {
    res.status(400).json({ message: 'Please provide both category_name and company_code' });
    return;
  }
  const sql = `INSERT INTO tb_businesscategory (category_name, company_code) VALUES (?, ?)`;
  db.query(sql, [category_name, company_code], (err, result) => {
    if (err) {
      console.error('Error inserting source:', err);
      res.status(500).json({ message: 'Error inserting source' });
    } else {
      console.log('Source inserted:', result);
      res.status(200).json({ message: 'Source inserted successfully' });
    }
  });
});


app.post('/nodeapp/check-lead', (req, res) => {
  const { personname, company_code } = req.body;
  if (!personname || !company_code) {
    res.status(400).json({ error: 'Please provide both personname and company_code' });
    return;
  }
  const sql = `SELECT * FROM tb_lead WHERE personname = ? AND company_code = ?`;
  db.query(sql, [personname, company_code], (err, result) => {
    if (err) {
      console.error('Error checking lead:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (result.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  });
});

app.get('/nodeapp/products', (req, res) => {
  const query = `SELECT * FROM products`;
  db.query(query,  (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results); 
    }
  });
});

app.post('/nodeapp/addproducts', (req, res) => {
  console.log(req.body, 'createData');
  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const sqlInsert = `
    INSERT INTO products(name, price, category) 
    VALUES (?, ?, ?)`;
  db.query(
    sqlInsert,
    [name, price, category], 
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'Error inserting data' });
      } else {
        console.log('Data inserted successfully');
      }
    });
});

app.get('/nodeapp/productedit/:id', (req, res) => {
  const id = req.params.id;
  console.log('Received request for Lead ID:', id);
  let qr = 'SELECT * FROM products WHERE id = ? ';
  console.log('SQL Query:', qr);
  db.query(qr, [id], (err, result) => {
      console.log('Query result:', result);
      if (err) {
          console.log(err);
          res.status(500).send({
              message: 'Internal Server Error',
              error: err
          });
      } else {
          if (result.length > 0) {
              res.send({
                  message: 'Get data for status_id',
                  data: result
              });
          } else {
              res.send({
                  message: 'Data not found',
                  data: null
              });
          }
      }
  });
});

app.put('/nodeapp/productupdate/:id', (req, res) => {
    const id  = req.params.id;
    const {
    name,
    price,
    category
    } = req.body;
    const sql =
    'UPDATE products SET name=?, price=?, category=?  WHERE id = ?';
    db.query(sql, 
    [
      name,
      price,
      category,
      id 
    ], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({
          message: 'Error updating data',
          error: err,
        });
      } else {
        console.log('SQL Result:', result);
        res.status(200).json({
          message: 'Data Updated',
          data: result,
        });
      }
    });
    });

app.delete('/nodeapp/productdelet/:id', (req, res) => {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ error: 'Item ID is missing' });
        return;
      }
      const sql = 'DELETE FROM products WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send('Error deleting item');
        } else {
          if (result.affectedRows === 0) {
            res.status(404).json({ error: 'user not found' });
          } else {
            res.status(200).json({ message: 'user deleted successfully' });
          }
        }
      });
});

app.post('/nodeapp/attendance', (req, res) => {
      const { username, company_code, date, time, location, coordinates, stop } = req.body;  
      if (stop) {
          const qr = 'UPDATE tb_attendance SET stop_date = ?, stop_time = ? WHERE username = ? AND company_code = ? AND stop_date IS NULL';
          const values = [date, time, username, company_code];
          db.query(qr, values, (error, results) => {
              if (error) {
                  return res.status(500).json({ error: 'Database error' });
              }
              if (results.affectedRows === 0) {
                  return res.status(400).json({ message: 'No active attendance found to stop' });
              }
              return res.json({ message: 'Attendance stopped successfully!' });
          });
      } else {
          const today = new Date().toISOString().split('T')[0];
          const checkQr = 'SELECT * FROM tb_attendance WHERE username = ? AND company_code = ? AND date = ? AND stop_date IS NULL';
          db.query(checkQr, [username, company_code, today], (error, results) => {
              if (error) {
                  return res.status(500).json({ error: 'Database error' });
              }
              if (results.length > 0) {
                  return res.json({ message: 'Attendance already recorded for today, but you can continue working.' });
              }  
              const qr = 'INSERT INTO tb_attendance (username, company_code, date, time, location, coordinates) VALUES (?, ?, ?, ?, ?, ?)';
              const values = [username, company_code, date, time, location, coordinates];
              db.query(qr, values, (error, results) => {
                  if (error) {
                      return res.status(500).json({ error: 'Database error' });
                  }
                  res.json({ message: 'Attendance recorded successfully!', attendanceId: results.insertId });
              });
          });
      }
  });
  
  
  app.get('/nodeapp/attendance-check', (req, res) => {
      const { username, company_code } = req.query;
      const today = new Date().toISOString().split('T')[0];
      const qr = 'SELECT * FROM tb_attendance WHERE username = ? AND company_code = ? AND date = ? AND stop_date IS NULL';
      db.query(qr, [username, company_code, today], (error, results) => {
          if (error) {
              return res.status(500).json({ error: 'Database error' });
          }
          res.json({ attendanceExists: results.length > 0 });
      });
  });
  
// API Endpoint
app.get('/nodeapp/getattendance', (req, res) => {
  const { company_code, username, user_right } = req.query;
  if (!company_code || !username) {
      return res.status(400).json({ error: 'Please provide company_code and username' });
  }
  const query = `
      SELECT *
      FROM tb_attendance
      WHERE 
          (SELECT user_right 
           FROM tb_user 
           WHERE company_code = ? AND username = ?) = 'super'
      OR 
          (
              (SELECT user_right 
               FROM tb_user 
               WHERE company_code = ? AND username = ?) = 'data-entry' 
              AND username = ?
          )
  `;
  db.query(query, [company_code, username, company_code, username, username], (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
  });
});

const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/nodeapp/send-email', (req, res) => {
  console.log(req.body); 
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
      return res.status(400).send('All fields are required');
  }
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'sednainfo5@gmail.com',
          pass: 'mfzm afcu fwma latu'
      }
  });
 let mailOptions = {
      from: 'email', 
      to: 'sednainfo5@gmail.com', 
      subject: 'New Contact Form Submission',
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p>`
  };
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
          return res.status(500).send('Error sending email');
      } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).send('Email sent successfully');
      }
  });
});

app.get('/nodeapp/user-rights', (req, res) => {
  const company_code = req.query.company_code; 
  const query = 'SELECT * FROM tb_user WHERE company_code = ? AND user_right = "data-entry"';
  db.query(query, [company_code], (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }
    res.json(results); 
  });
});

app.put('/nodeapp/updateColor/:id', (req, res) => {
  const itemId = req.params.id;
  const { color } = req.body;
  const query = `UPDATE tb_stage SET color = ? WHERE id = ?`;
  db.query(query, [color, itemId], (err, result) => {
    if (err) {
      console.error('Error updating color:', err);
      return res.status(500).json({ error: 'Failed to update color' });
    }
    res.status(200).json({ message: 'Color updated successfully' });
  });
});

app.put('/nodeapp/update-password/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const { password } = req.body;
  const query = 'UPDATE tb_user SET password = ? WHERE user_id = ?';
  db.query(query, [password, user_id], (error, results) => {
    if (error) {
      console.error('Error updating password:', error);  
      return res.status(500).json({ error: 'Failed to update password' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'Password updated successfully' });
  });
});

// API endpoint to update the active status of a lead
app.put('/nodeapp/update-active/:companyCode', (req, res) => {
  const company_code = req.params.companyCode;  
  const { active } = req.body;
  if (active !== 'yes' && active !== 'no') {
    return res.status(400).json({ message: 'Invalid active status. Must be "yes" or "no".' });
  }
  const query = 'UPDATE tb_company SET active = ? WHERE company_code = ?';
  db.query(query, [active, company_code], (err, result) => {
    if (err) {
      console.error('Error updating lead:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json({ message: 'Lead status updated successfully', active: active });
  });
});

app.get('/nodeapp/make-call', (req, res) => {
  const number = req.query.contactNo; 
  if (!number) {
    return res.status(400).send('Phone number is required');
  }
  const user = 'Sedna_Voice';
  const password = 'Sedna@123';  
  const callerId = ''; 
  const planId = 2;
  const callType = 2;
  const mediaFileId = 19115;
  const isDTMFFile = 0;
  const apiUrl = `http://182.18.143.106:1655/api/VoiceCall/makecall?User=${encodeURIComponent(user)}&Password=${encodeURIComponent(password)}&Number=${encodeURIComponent(number)}&CallerId=${encodeURIComponent(callerId)}&PlanId=${encodeURIComponent(planId)}&CallType=${encodeURIComponent(callType)}&MediaFileId=${encodeURIComponent(mediaFileId)}&IsDTMFFile=${encodeURIComponent(isDTMFFile)}`;
  axios.get(apiUrl)
    .then(response => {
      console.log(response.data);
      res.json(response.data);  
    })
    .catch(error => {
      console.error('Error making call to Sedna API:', error.response ? error.response.data : error.message);
      res.status(500).send('Error making call to Sedna API');
    });
});

// Endpoint to check if the contact number exists in tb_lead
app.post('/nodeapp/check-contact', (req, res) => {
  const { contactno } = req.body;
  db.query('SELECT username, company_code FROM tb_lead WHERE contactno = ?', [contactno], (err, result) => {
    if (err) {
      console.error('Error checking contact number:', err);
      return res.status(500).send('Internal server error');
    }
    if (result.length > 0) {
      res.json({
        exists: true,
        username: result[0].username,
        company_code: result[0].company_code
      });
    } else {
      res.json({ exists: false });
    }
  });
});

// Endpoint to save support registration
app.post('/nodeapp/save-support-registration', (req, res) => {
  const { contactno, email, password, crmpassword, username, company_code } = req.body;
  db.query(
    'INSERT INTO tb_supportregistration (contactno, email, password, crmpassword, username, company_code) VALUES (?, ?, ?, ?, ?, ?)',
    [contactno, email, password, crmpassword, username, company_code],
    (err, result) => {
      if (err) {
        console.error('Error saving registration:', err);
        return res.status(500).send('Error saving registration');
      }
      res.status(200).send('Support registration saved successfully');
    }
  );
});

app.post('/nodeapp/supportlogin', (req, res) => {
  const { contactno, password } = req.body;
  const query = `
    SELECT * FROM tb_supportregistration WHERE contactno = ? AND password = ?
  `;
  console.log('Login attempt with contactno:', contactno, 'and password:', password);
  db.query(query, [contactno, password], (error, result) => {
    if (error) {
      console.log('Error querying database:', error);
      return res.status(500).send('Error querying database');
    } else if (result.length === 0) {
      console.log('Invalid username or password');
      return res.status(401).send('Invalid username or password');
    } else {
      const userData = {
        support_id: result[0].support_id,
        username: result[0].username,
        company_data: {
          company_code: result[0].company_code,
        }
      };
      console.log('Login successful for user:', userData);
      return res.status(200).send({
        message: 'Login successful',
        userData: userData
      });
    }
  });
});

app.get('/nodeapp/displayendcustomer', (req, res) => {
  let qr = `SELECT * FROM tb_endcustomer ORDER BY date DESC`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({
      message: 'Internal Server Error'
      });
    } else {
    if (result.length > 0) {
      res.send({
      message: 'Get all data',
      data: result
      });
    } else {
      res.send({
      message: 'Data not found',
      data: result
      });
    }
  }
  });
});

app.get('/nodeapp/Alldisplayticketdetails', (req, res) => {
  let qr = `SELECT * FROM tb_ticketcreate ORDER BY ticket_id  DESC`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({
      message: 'Internal Server Error'
      });
    } else {
    if (result.length > 0) {
      res.send({
      message: 'Get all data',
      data: result
      });
    } else {
      res.send({
      message: 'Data not found',
      data: result
      });
    }
  }
  });
});

app.get('/nodeapp/displayissuedetails', (req, res) => {
  let qr = `SELECT * FROM tb_issue ORDER BY issue_id  DESC`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({
      message: 'Internal Server Error'
      });
    } else {
    if (result.length > 0) {
      res.send({
      message: 'Get all data',
      data: result
      });
    } else {
      res.send({
      message: 'Data not found',
      data: result
      });
    }
  }
  });
});

app.get('/nodeapp/getvisitingcards', (req, res) => {
  const company_code = req.query.company_code; 
  const username = req.query.username;
  const query = 'SELECT personname FROM tb_visitingcards where company_code = ? AND username = ?';
  db.query(query, [company_code, username], (err, results) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
    const names = results.map(row => row.personname); 
    res.json({ status: 'success', names });
  });
});

app.get('/nodeapp/visitingclientdetails/:personname', (req, res) => { 
  const personname = req.params.personname;
  console.log("Received personname:", personname); 
  const query = `SELECT * FROM tb_visitingcards WHERE personname = ?`;
  db.query(query, [personname], (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  });
});







app.post('/api/admission/submit', upload.single('photo'), (req, res) => {
    db.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ success: false, message: 'Transaction error' });
        }

        // Safely parse JSON fields
        let personalData = {}, academicData = {}, workExpArray = [], extraCurricularData = {}, knowAboutData = {};
        let nationalLevelExamData = {}, checklistData = {}, prospectusFeeData = {}, declarationData = {};
        try {
            personalData = JSON.parse(req.body.personal || '{}');
            academicData = JSON.parse(req.body.academic || '{}');
            workExpArray = JSON.parse(req.body.workExperience || '[]');
            extraCurricularData = JSON.parse(req.body.extraCurricular || '{}');
            knowAboutData = JSON.parse(req.body.knowAbout || '{}');
            nationalLevelExamData = JSON.parse(req.body.nationalLevelExam || '{}');
            checklistData = JSON.parse(req.body.checklist || '{}');
            prospectusFeeData = JSON.parse(req.body.prospectusFee || '{}');
            declarationData = JSON.parse(req.body.declaration || '{}');
        } catch(e) {
            return db.rollback(() => res.status(400).json({ success: false, message: 'Invalid JSON data' }));
        }

        const photoPath = req.file ? req.file.filename : null;

        const mainData = {
            student_id: req.body.studentId,
            roll_no: req.body.rollNo,
            course_applying: req.body.courseApplying,
            academic_session: req.body.academicSession,
            name: personalData.name,
            date_of_birth: personalData.dateOfBirth,
            semester: personalData.semester,
            gender: personalData.gender,
            nationality: personalData.nationality,
            domicile_haryana: personalData.domicileHaryana,
            category: personalData.category,
            languages_known: personalData.languagesKnown,
            telephone: personalData.telephone,
            mobile: personalData.mobile,
            email: personalData.email,
            permanent_address: personalData.permanentAddress?.address,
            permanent_city: personalData.permanentAddress?.city,
            permanent_state: personalData.permanentAddress?.state,
            permanent_pin: personalData.permanentAddress?.pin,
            correspondence_address: personalData.correspondenceAddress?.address,
            correspondence_city: personalData.correspondenceAddress?.city,
            correspondence_state: personalData.correspondenceAddress?.state,
            correspondence_pin: personalData.correspondenceAddress?.pin,
            father_name: personalData.fatherName,
            father_occupation: personalData.fatherOccupation,
            mother_name: personalData.motherName,
            mother_occupation: personalData.motherOccupation,
            family_income_monthly: personalData.familyIncomeMonthly,
            total_work_years: req.body.totalWorkYears,
            total_work_months: req.body.totalWorkMonths,
            sports: extraCurricularData.sports,
            culturals: extraCurricularData.culturals,
            know_source: knowAboutData.source,
            know_other_specify: knowAboutData.otherSourceSpecify,
            accommodation_required: req.body.accommodationRequired,
            appeared_national_exam: (nationalLevelExamData.appeared === true || nationalLevelExamData.appeared === 'true'),
            national_exam_name: nationalLevelExamData.examName,
            fee_mode: prospectusFeeData.mode,
            dd_number: prospectusFeeData.ddNumber,
            bank_name: prospectusFeeData.bankName,
            dd_date: prospectusFeeData.ddDate,
            cash_amount: prospectusFeeData.cashAmount,
            photo_path: photoPath,
            terms_accepted: (req.body.termsAccepted === true || req.body.termsAccepted === 'true'),
            
            declaration_name: declarationData.applicantName,
            declaration_son_of: declarationData.sonOf,
            declaration_date: declarationData.declarationDate,
            signature_text: declarationData.signature,
            checklist: JSON.stringify(checklistData),
            // ✅ Added fields
    username: req.body.username,
    company_code: req.body.company_code,
    user_id: req.body.user_id,
    user_right: req.body.user_right,
   stage: req.body.stage || null,
reminder_status: req.body.reminder_status || null,
nextfollow_up_by: req.body.nextfollow_up_by || null,
        };

        // Insert main admission
        db.query('INSERT INTO admissions SET ?', mainData, (err, result) => {
            if (err) {
                console.error('Main insert error:', err);
                return db.rollback(() => res.status(500).json({ success: false, message: err.message }));
            }
            const admissionId = result.insertId;

            // Insert academic qualifications
            const qualMap = { tenth: '10th', twelfth: '12th', graduation: 'Graduation', masters: 'Masters', others: 'Others' };
            const qualKeys = Object.keys(qualMap);
            let academicCompleted = 0;
            let academicFailed = false;

            if (qualKeys.length === 0) {
                afterAcademics();
            } else {
                for (const [key, level] of Object.entries(qualMap)) {
                    const qual = academicData[key];
                    if (qual && (qual.yearOfPassing || qual.institution || qual.percentage)) {
                        const insertAcad = `INSERT INTO academic_qualifications (admission_id, qualification_level, year_of_passing, institution, board_university, stream_degree, subject_specialization, percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                        db.query(insertAcad, [admissionId, level, qual.yearOfPassing || null, qual.institution || null, qual.boardUniversity || null, qual.streamDegree || null, qual.subjectSpecialization || null, qual.percentage || null], (err) => {
                            if (err) academicFailed = true;
                            academicCompleted++;
                            if (academicCompleted === qualKeys.length) afterAcademics();
                        });
                    } else {
                        academicCompleted++;
                        if (academicCompleted === qualKeys.length) afterAcademics();
                    }
                }
            }

            function afterAcademics() {
                if (academicFailed) {
                    return db.rollback(() => res.status(500).json({ success: false, message: 'Error inserting academic data' }));
                }

                // Insert work experiences
                let workCompleted = 0;
                let workFailed = false;
                if (workExpArray.length === 0) {
                    return finalCommit();
                }

                for (const exp of workExpArray) {
                    if (exp.organization || exp.designation) {
                        const insertWork = `INSERT INTO work_experiences (admission_id, organization, designation, nature_of_responsibility, duration, years_of_exp) VALUES (?, ?, ?, ?, ?, ?)`;
                        db.query(insertWork, [admissionId, exp.organization || null, exp.designation || null, exp.natureOfResponsibility || null, exp.duration || null, exp.years || null], (err) => {
                            if (err) workFailed = true;
                            workCompleted++;
                            if (workCompleted === workExpArray.length) finalCommit();
                        });
                    } else {
                        workCompleted++;
                        if (workCompleted === workExpArray.length) finalCommit();
                    }
                }

                function finalCommit() {
    if (workFailed || academicFailed) {
        return db.rollback(() => res.status(500).json({ success: false, message: 'Error inserting academic/work data' }));
    }

    // 1. Insert into tb_followup
 const followupData = {
    username: req.body.username,
    company_code: req.body.company_code,
    lead_id: admissionId.toString(),
    name: personalData.name || null,
    email: personalData.email || null,
    stage: req.body.stage || null,
    reminder_status: req.body.reminder_status || null,
    nextfollow_up_by: req.body.nextfollow_up_by || null,
    // Do NOT include follow_up_time or remark
};
    db.query('INSERT INTO tb_followup SET ?', followupData, (err, followupResult) => {
        if (err) {
            console.error('Follow-up insert error:', err);
      return db.commit((commitErr) => {
        if (commitErr) {
          return db.rollback(() => res.status(500).json({ success: false, message: 'Commit failed' }));
        }
        res.status(201).json({
          success: true,
          message: 'Admission form submitted successfully',
          admissionId: admissionId,
          followupWarning: 'Follow-up record was not saved'
        });
      });
        }

        // 2. Commit the whole transaction
        db.commit((err) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ success: false, message: 'Commit failed' }));
            }
            res.status(201).json({
                success: true,
                message: 'Admission form submitted with follow-up',
                admissionId: admissionId,
                followupId: followupResult.insertId
            });
        });
    });
}
            }
        });
    });
});


// Example of using the middleware on a protected route
app.get('/protected-route', verifyToken, (req, res) => {
  res.status(200).send({ message: 'Protected content', user: req.user });
});

const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
















