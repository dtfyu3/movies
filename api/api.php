<?php
function getDbConnection()
{
    $servername = "localhost";
    $username = "root";
    $password = "1q2w3e4r5t6y0";
    $dbname = "movies";
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}

function getMoviesNames()
{
    try {
        $conn = getDbConnection();
        $stmt = $conn->prepare('select * from movies_list order by name');
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $response['success'] = true;
            $response['data'][] = [
                'name' => $row['name']
            ];
        }
        $stmt->close();
        $conn->close();
    } catch (Exception $e) {
        $response['error'] = $e->getMessage();
    }
    echo json_encode($response);
}
function getMyAPIKey(){
    function loadEnv($file) {
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $env = [];
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $env[trim($key)] = trim($value);
            }
        }
        
        return $env;
    }
    
    // Загружаем переменные из .env
    $env = loadEnv('../.env');

    $data = ['api_key' => $env];
    
    echo json_encode($data);
}
$data = json_decode(file_get_contents('php://input'), true);
$get_action = null;
if (isset($_GET['get_action'])) $get_action = $_GET['get_action'];
if ($get_action) {
    if ($get_action === 'getMoviesNames') getMoviesNames();
    elseif ($get_action === 'getMyAPIKey') getMyAPIKey();
}
