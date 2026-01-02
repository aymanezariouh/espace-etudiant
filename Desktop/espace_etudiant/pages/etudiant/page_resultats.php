<?php
$root = __DIR__ . "/../..";  

require_once $root . '/config/database.php';
require_once $root . '/classes/Database.php';
require_once $root . '/classes/Security.php';
require_once $root . '/classes/Category.php';
require_once $root . '/classes/Quiz.php';
require_once $root . '/classes/Question.php';
require_once $root . '/classes/Result.php';


if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    header('Location: ../auth/login.php'); 
    exit();
}
$qz = new Quiz();
$id_qu = $_GET['quiz_id'] ?? null;
$quize= $qz -> getById($id_qu);
$etudiantId = $_SESSION['user_id'];
$quest = new Question();
$questions = $quest -> getAllByQuiz($id_qu);
$res= new Result();
$results = $res->getMyResults($etudiantId);

$score = $_GET['score'] ?? 0;
$total_questions = $_GET['total_questions'] ?? 0;
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Résultat du Quiz</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }

    body {
      background: #f4f6f8;
      color: #333;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }

    .confirmation-card {
      background: #fff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      background: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 48px;
      color: white;
    }

    h1 {
      font-size: 26px;
      color: #1e293b;
      margin-bottom: 15px;
    }

    .message {
      font-size: 18px;
      color: #475569;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .score-display {
      background: #f1f5f9;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .score-display h2 {
      font-size: 48px;
      color: #2563eb;
      margin-bottom: 10px;
    }

    .score-display p {
      font-size: 16px;
      color: #64748b;
    }

    .quiz-title {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 20px;
    }

    .btn-group {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      transition: all 0.3s;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #1e293b;
    }

    .btn-secondary:hover {
      background: #d1d5db;
    }

    @media (max-width: 768px) {
      .confirmation-card {
        padding: 30px 20px;
      }

      h1 {
        font-size: 22px;
      }

      .score-display h2 {
        font-size: 36px;
      }
    }
  </style>
</head>

<body>

<div class="confirmation-card">
  <div class="success-icon">✓</div>
  
  <h1>Votre réponse a été envoyée !</h1>
  
  <p class="message">
    Félicitations ! Vous avez terminé le quiz avec succès.
  </p>

  <div class="quiz-title">
    <strong><?= $quize['titre'] ?></strong>
  </div>

  <div class="score-display">
    <h2><?= $score ?> / <?= $total_questions ?></h2>
    <p>Voici votre score !</p>
  </div>

  <div class="btn-group">
    <a href="dashboaard-etudiant.php" class="btn btn-primary">
      Retour au Dashboard
    </a>
    <a href="dashboaard-etudiant.php" class="btn btn-secondary">
      Voir l'historique
    </a>
  </div>
</div>

</body>
</html>