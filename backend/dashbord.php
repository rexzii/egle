<?php
error_reporting(0);
session_start(); // Start the session

// Check if the user is logged in
if (!isset($_SESSION['loggedin']) || !$_SESSION['loggedin']) {
    header("Location: index.php");
    exit();
}

// Get URL parameters
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
$username = isset($_GET['username']) ? $_GET['username'] : '';
$password = isset($_GET['password']) ? $_GET['password'] : '';

// Verify URL parameters against session data
if ($user_id !== $_SESSION['user_id'] || $username !== $_SESSION['username']) {
    // Invalid parameters or not logged in
    echo '<p>Page not active. Invalid parameters.</p>';
    exit();
}

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "sample_portal_system";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to select unique sample_code, count of records, stock_out dates, and minimum quantity
$sql = "
    SELECT r.sample_code,
           COUNT(*) as record_count,
           GROUP_CONCAT(DISTINCT 
               CASE 
                   WHEN b.stock_out IS NOT NULL THEN b.stock_out 
                   ELSE NULL 
               END
               ORDER BY b.stock_out ASC SEPARATOR ', '
           ) as stock_out_dates,
           COALESCE(m.min_qty, 'N/A') as min_qty
    FROM tb_results r
    LEFT JOIN tb_results b ON r.sample_code = b.sample_code
    LEFT JOIN tb_master m ON r.sample_code = m.sample_code
    WHERE r.invoice_no IS NOT NULL
      AND r.invoice_no != ''
    GROUP BY r.sample_code
";
$result = $conn->query($sql);

// Check for query execution errors
if (!$result) {
    die("Error executing query: " . $conn->error);
}

include 'header.php'; 
include 'sidebar.php'; 
?>
<div class="content">
<br><br>

    <h1>Item Records</h1>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            color: black; /* Set text color to black */
        }

        th {
            background-color: #f2f2f2;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .highlight-red {
            background-color: red;
            color: white; /* Ensure text color is white for visibility on red background */
        }

        tr:hover {
            background-color: #ddd;
        }
    </style>
    <table id="resultsTable">
        <thead>
            <tr>
                <th>Sample Codes</th> <!-- Header for sample_codes -->
                <th>Record Count</th> <!-- Header for record_count -->
                <th>Stock Out Dates</th> <!-- Header for stock_out_dates -->
                <th>Minimum Quantity</th> <!-- Header for min_qty -->
            </tr>
        </thead>
        <tbody>
            <?php
            if ($result->num_rows > 0) {
                // Output data of each row
                while ($row = $result->fetch_assoc()) {
                    // Determine the class for the entire row
                    $rowClass = (is_numeric($row['min_qty']) && $row['min_qty'] < 15) ? 'highlight-red' : '';

                    echo "<tr class='$rowClass'>";
                    echo "<td>" . htmlspecialchars($row['sample_code']) . "</td>"; // Display sample_codes
                    echo "<td>" . htmlspecialchars($row['record_count']) . "</td>"; // Display record_count
                    echo "<td>" . htmlspecialchars($row['stock_out_dates'] ? $row['stock_out_dates'] : 'N/A') . "</td>"; // Display stock_out_dates
                    echo "<td>" . htmlspecialchars($row['min_qty']) . "</td>"; // Display min_qty
                    echo "</tr>";
                }
            } else {
                echo "<tr><td colspan='4'>No results found</td></tr>"; // Adjusted colspan for new columns
            }
            ?>
        </tbody>
    </table>
</div>

<?php
// Close connection
$conn->close();
include 'footer.php'; 
?>
