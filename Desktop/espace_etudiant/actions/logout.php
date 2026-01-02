<?php
require_once '../config/database.php';
require_once '../classes/Database.php';
require_once '../classes/Security.php';
require_once '../classes/User.php';
$user = new User();
$user  -> logout();
header("location: ../../index.php");
exit ;
?>