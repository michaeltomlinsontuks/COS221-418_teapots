<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meet the Team</title>
    <style>
        body {
            background-image: repeating-linear-gradient(to right, cyan, #179aca, aqua);
            background-size: 200% 100%;
            font-family: 'Courier New', sans-serif;
            max-width: 1800px;
            margin: 0 auto;
            padding: 40px;
            text-align: center;
            background-color: #f9f9f9;
        }
        .title-container {
            
            display: flex;
            align-items: center;
            gap: 20px;
           padding: 20px;
           max-width: 70%; 
        }

        .logo {
            width: 80px;
            height: auto;
        }

        .main-title {
            font-size: 5rem;
            margin: 0;
        }
       
        h1 {
            color: #2c3e50;
            margin: 50px 0;
            font-size: 3.5em;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .team-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            margin: 50px 0;
            
            
        }
        .team-row {
            display: flex;
            justify-content: center;
            gap: 40px;
            width: 100%;
            margin-bottom: 40px;
        }
        .team-card {
            display: flex;
            width: 48%;
            min-width: 700px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
            overflow: hidden;
        }
        .team-card:hover {
            transform: translateY(-10px);
        }
        .member-profile {
            padding: 30px;
            width: 280px;
            text-align: center;
        }
        .member-profile img {
            width: 250px;
            height: 250px;
            border-radius: 30%;
            object-fit: cover;
            border: 5px solid #ecf0f1;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .member-profile p {
            font-weight: bold;
            margin-top: 25px;
            font-size: 1.8em;
            color: #2c3e50;
        }
        .role-tag {
            font-size: 30px;
            color: black;
            margin-top: 15px;
            padding: 8px 20px;
            background: #ecf0f1;
            border-radius: 30px;
            display: inline-block;
        }
        
        .front
        {
            background-color: lightgoldenrodyellow;
            color: black;
        }
        .API
        {
            background-color: lightgray;
            color: black;
        }
        .DB
        {
            background-color: lightpink;
            color: black;
        }
        .member-details {
            flex: 1;
            padding: 40px;
            text-align: left;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .member-details h3  {
            color: black;
            font-size: 1.5em;
            margin-bottom: 20px;
        }
        .member-details p {
            font-size: 1.2em;
            line-height: 1.6;
            color: black;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="title-container">
        <img src="images/teapotsLogoPot.png" alt="Teapots Logo" class="logo">
        <h1 class="main-title">Meet The Teapots</h1>
    </div>
    
    <div class="team-container">
        <div class="team-row">
            <div class="team-card">
                <div class="member-profile">
                    <img src="images/wilmar.jpg" alt="Wilmar">
                    <p>Wilmar Smit</p>
                    <div class="role-tag front">Front End Team</div>
                </div>
                <div class="member-details front">
                    <h3>About Wilmar</h3>
                    <p>"Deadlines are scary but the regret of missing them cuts deeper" ~ Wilmar</p>
                    <p>Fun Fact: "Damn this is tough💀"</p>
                    <p>Dream Career: AI Machine Learning.</p>
                </div>
            </div>
            
            <div class="team-card">
                <div class="member-profile">
                    <img src="images/dawid.jpg" alt="Dawid">
                    <p>Dawid Eales</p>
                    <div class="role-tag front">Front End Team</div>
                </div>
                <div class="member-details front">
                    <h3>About Dawid</h3>
                    <p>"Fly@UP"</p>
                    <p>Fun fact: Likes rocks</p>
                    <p>Dream Career: cyber-security</p>
                </div>
            </div>
        </div>
        

        <div class="team-row">
            <div class="team-card">
                <div class="member-profile">
                    <img src="images/michael.jpg" alt="Michael">
                    <p>Michael Tomlinson</p>
                    <div class="role-tag API">API Team</div>
                </div>
                <div class="member-details API">
                    <h3>About Michael</h3>
                    <p>“while(! (succeed = try()));”~ Michael</p>
                    <p>Fun fact: "I am partially deaf - or so I’ve heard"</p>
                    <p>Dream Career: AI Virtual Assistant Development</p>
                </div>
            </div>
            

            <div class="team-card">
                <div class="member-profile">
                    <img src="images/damian.jpg" alt="Damian">
                    <p>Damian Moustakis</p>
                    <div class="role-tag API">API Team</div>
                </div>
                <div class="member-details API">
                    <h3>About Damian</h3>
                    <p>“Live long and prosper" ~ Spock </p>
                    <p>Fun fact: "I used to torture myself by rowing everyday for 7 years… for no plausible reason"</p>
                    <p>Dream Career: AI Machine Learning.</p>
                </div>
            </div>
        </div>
        

        <div class="team-row">

            <div class="team-card">
                <div class="member-profile">
                    <img src="images/ayrtonn.jpg" alt="ayrtonn">
                    <p>Ayrtonn Taljaard</p>
                    <div class="role-tag DB">Database Team</div>
                </div>
                <div class="member-details DB">
                    <h3>About Ayrtonn</h3>
                    <p>"Remember today is the tomorrow you worried about yesterday" ~ Ayrtonn</p>
                    <p>Fun fact: "I'm alive"</p>
                    <p>Dream Career: Software Development</p>
                </div>
            </div>
            
            <div class="team-card">
                <div class="member-profile">
                    <img src="images/aaron.jpg" alt="aaron">
                    <p>Aaron Kim</p>
                    <div class="role-tag DB">Database Team</div>
                </div>
                <div class="member-details DB">
                    <h3>About Aaron</h3>
                    <p>"When in doubt, go flat out" ~ Colin McRae</p>
                    <p>Fun fact: "I like watching cars go in circles"</p>
                    <p>Dream Career: VR/AR Development</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>