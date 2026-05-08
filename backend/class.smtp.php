<?php
session_start(); // Start the session

// Database connection settings
$servername = "localhost";
$dbusername = "root";
$dbpassword = "";
$dbname = "sample_portal_system";

// Create a database connection
$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $conn->real_escape_string(trim($_POST['username']));
    $password = trim($_POST['password']);

    // Query to fetch the user from the database
    $query = "SELECT user_id, username, email, password FROM tb_user WHERE username = '$username' AND active = 1";
    $result = $conn->query($query);

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $hashed_password = $row['password']; // Assuming passwords are stored hashed
        
        // Verify the provided password against the hashed password
        if ($password === $hashed_password) {
            // Set session variables
            $_SESSION['loggedin'] = true;
            $_SESSION['username'] = $row['username'];
            $_SESSION['user_id'] = $row['user_id'];
            $_SESSION['email'] = $row['email'];

            // Redirect to dashboard with URL parameters
            header("Location: dashboard.php?user_id=" . urlencode($row['user_id']) . "&username=" . urlencode($row['username']) . "&password=" . urlencode($hashed_password));
            exit();
        } else {
            $error = "Invalid username or password.";
        }
    } else {
        $error = "Invalid username or password.";
    }
}

// Close the database connection
$conn->close();
?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f4f4f4; /* Light background color for the login page */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh; /* Full viewport height */
        }

        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            width: 100%;
            max-width: 600px; /* Max width for the form container */
            background-color: #fff; /* White background for the form */
            border-radius: 8px; /* Rounded corners */
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Shadow for depth */
            padding: 20px;
            box-sizing: border-box;
        }

        .form-container {
            width: 100%;
        }

        form {
            display: flex;
            flex-direction: column;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }

        button {
            width: 100%;
            padding: 10px;
            background-color: #444;
            color: #fff;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            margin-bottom: 10px;
        }

        button:hover {
            background-color: #555;
        }

        .error {
            color: red;
            margin-top: 10px;
            text-align: center;
        }

        .side-buttons {
            margin-top: 20px;
            text-align: center;
            display: flex; /* Use flexbox to align buttons horizontally */
            gap: 10px; /* Space between buttons */
        }

        .side-buttons .button {
            flex: 1; /* Ensure buttons take up equal space */
            max-width: 200px; /* Optional: Max width for the buttons */
        }

        .side-buttons a {
            color: #fff;
            text-decoration: none;
        }
    </style>
</head>
<body>

<main>
    <div class="container">
        <div class="form-container">
            <form action="index.php" method="post">
                <input type="text" name="username" placeholder="Enter Username" required>
                <input type="password" name="password" placeholder="Enter Password" required>
                <button type="submit" class="button">Sign In</button>
            </form>
            <?php if (isset($error)) { echo '<p class="error">' . htmlspecialchars($error) . '</p>'; } ?>
        </div>
        <div class="side-buttons">
            <button class="button"><a href="locate_item.php">Locate Item Screen</a></button>
            <button class="button"><a href="stock_out.php">Item Out Screen</a></button>
        </div>
    </div>
</main>

</body>
</html>
