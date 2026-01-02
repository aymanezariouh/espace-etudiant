<?php
$root = __DIR__ . "/..";  

require_once '../config/database.php';
require_once '../classes/Database.php';
require_once '../classes/Security.php';
require_once '../classes/Category.php';
require_once '../classes/Question.php';
$db = Database::getInstance();
if (!isset($_SESSION['user_id'])) {
    die("walo conexion");
}
$etudiant_id = $_SESSION['user_id']; 
$quiz_id = $_POST['quiz_id'] ?? null;
$answers = $_POST['answers'] ?? [];

if (!$quiz_id || empty($answers)) {
    die("Quiz ID ou réponses manquantes.");
}
$questionObj = new Question();
$questions = $questionObj->getAllByQuiz($quiz_id);
$score = 0;
$total_questions = count($questions);


foreach ($questions as $q) {
    $qid = $q['id'];
    $correct_option = $q['correct_option']; 

    if (isset($answers[$qid]) && $answers[$qid] == $correct_option) {
        $score++;
    }
}
$sql = "INSERT INTO results (quiz_id, etudiant_id, score, total_questions) 
        VALUES (?, ?, ?, ?)";
$db->query($sql, [$quiz_id, $etudiant_id, $score, $total_questions]);
header("Location: ../pages/etudiant/page_resultats.php?score=$score&total_questions=$total_questions&quiz_id=$quiz_id");
exit;

?>
