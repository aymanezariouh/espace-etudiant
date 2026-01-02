<?php 
require_once '../../config/database.php';
require_once '../../classes/Database.php';
require_once '../../classes/Security.php';
require_once '../../classes/Category.php';
require_once '../../classes/Quiz.php';
require_once '../../classes/Question.php';
$qz = new Quiz();
$id_qu = $_GET['quiz_id'] ?? null;
$quize= $qz -> getById($id_qu);
$quest = new Question();
$questions = $quest -> getAllByQuiz($id_qu);
?> 

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Passer le Quiz</title>
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
    }

    .container {
      max-width: 800px;
      margin: 40px auto;
      background: #fff;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    }

    h1 {
      font-size: 22px;
      margin-bottom: 10px;
    }

    .quiz-desc {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 25px;
    }

    .question {
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .question h3 {
      font-size: 16px;
      margin-bottom: 10px;
    }

    .options label {
      display: block;
      padding: 8px 10px;
      margin-bottom: 8px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
    }

    .options input {
      margin-right: 8px;
    }

    .submit-btn {
      margin-top: 30px;
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 12px 20px;
      font-size: 15px;
      border-radius: 8px;
      cursor: pointer;
    }

    .submit-btn:hover {
      background: #1e40af;
    }

    .info {
      font-size: 13px;
      color: #475569;
      margin-top: 15px;
    }
  </style>
</head>

<body>

<div class="container">

  <!-- Quiz Header -->
  <h1><?php echo $quize['titre']; ?> </h1>
  <p class="quiz-desc">
    Répondez à toutes les questions avant de soumettre le quiz.
  </p>

  <!-- Quiz Form -->
  <form method="POST" action="/actions/quiz_submit.php">

    <!-- CSRF Token (backend) -->
    <input type="hidden" name="csrf_token" value="<!-- TOKEN -->">
    <input type="hidden" name="quiz_id" value="1">

    <!-- Question 1 -->
    <div class="question">
        <?php foreach($questions as $question) {?> 
      <h3><?= $question['question'] ?></h3>
      <div class="options">
        <label>
          <input type="radio" name="answers[<?= $question['id'] ?>]" value="1" required>
          <?= $question['option1'] ?>
        </label>
        <label>
          <input type="radio" name="answers[<?= $question['id'] ?>]" value="2">
          <?= $question['option2']  ?>
        </label>
        <label>
          <input type="radio" name="answers[<?= $question['id'] ?>]" value="3">
          <?= $question['option3'] ?>
        </label>
        <label>
          <input type="radio" name="answers[<?= $question['id'] ?>]" value="4">
          <?= $question['option4'] ?>
        </label>
      </div>
      <?php } ?>
    </div>
    <!-- Submit -->
    <button type="submit" class="submit-btn">
      Soumettre le quiz
    </button>

    <p class="info">
    Une seule tentative est autorisée. Le score sera calculé côté serveur.
    </p>

  </form>

</div>

</body>
</html>
