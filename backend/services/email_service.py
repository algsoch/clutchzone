import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional
import asyncio
from datetime import datetime

# Brevo (Sendinblue) SMTP Configuration
BREVO_SMTP_HOST = "smtp-relay.brevo.com"
BREVO_SMTP_PORT = 587
BREVO_USER = os.getenv("BREVO_USER", "9220c3001@smtp-brevo.com")
BREVO_SMTP_KEY = os.getenv("BREVO_SMTP_KEY", "WcDQh3SgMVxjYZ8B")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@clutchzone.com")
FROM_NAME = "ClutchZone"

class EmailService:
    def __init__(self):
        self.smtp_host = BREVO_SMTP_HOST
        self.smtp_port = BREVO_SMTP_PORT
        self.smtp_user = BREVO_USER
        self.smtp_key = BREVO_SMTP_KEY
        self.from_email = FROM_EMAIL
        self.from_name = FROM_NAME

    async def send_email(self, to_email: str, subject: str, html_content: str, 
                        text_content: Optional[str] = None, to_name: Optional[str] = None):
        """Send email via Brevo SMTP"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = f"{to_name} <{to_email}>" if to_name else to_email

            # Create text part
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)

            # Create HTML part
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Send email
            await self._send_smtp_email(message)
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False

    async def _send_smtp_email(self, message: MIMEMultipart):
        """Send email via SMTP"""
        def send_email_sync():
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_key)
                server.send_message(message)

        # Run in thread to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, send_email_sync)

# Initialize email service
email_service = EmailService()

# Email Templates
def get_welcome_email_template(username: str) -> tuple[str, str]:
    """Get welcome email template"""
    subject = "🎉 Welcome to ClutchZone - Your Gaming Journey Starts Now!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ClutchZone</title>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
                color: #ffffff;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 40px;
                border: 1px solid rgba(0, 255, 255, 0.2);
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 2.5rem;
                font-weight: bold;
                background: linear-gradient(45deg, #00ffff, #ff6b35);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }}
            .trophy {{
                font-size: 4rem;
                margin: 20px 0;
            }}
            .title {{
                font-size: 2rem;
                margin-bottom: 10px;
                color: #00ffff;
            }}
            .subtitle {{
                color: #b0b0b0;
                margin-bottom: 30px;
            }}
            .xp-badge {{
                background: linear-gradient(45deg, #00ffff, #ffd700);
                color: #000;
                padding: 10px 20px;
                border-radius: 25px;
                font-weight: bold;
                display: inline-block;
                margin: 20px 0;
            }}
            .features {{
                margin: 30px 0;
            }}
            .feature {{
                background: rgba(0, 255, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                margin: 15px 0;
                border-left: 4px solid #00ffff;
            }}
            .feature-title {{
                font-weight: bold;
                color: #00ffff;
                margin-bottom: 5px;
            }}
            .btn {{
                display: inline-block;
                background: linear-gradient(45deg, #00ffff, #ff6b35);
                color: #000;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
            }}
            .footer {{
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: #b0b0b0;
                font-size: 0.9rem;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ClutchZone</div>
                <div class="trophy">🏆</div>
                <h1 class="title">Welcome, {username}!</h1>
                <p class="subtitle">Your elite gaming journey starts here</p>
                <div class="xp-badge">+100 XP Welcome Bonus</div>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-title">🎮 Join Tournaments</div>
                    <div>Compete in daily tournaments across multiple games</div>
                </div>
                <div class="feature">
                    <div class="feature-title">📊 Track Progress</div>
                    <div>Monitor your XP, level, and ranking on the leaderboard</div>
                </div>
                <div class="feature">
                    <div class="feature-title">💰 Win Prizes</div>
                    <div>Earn real money and rewards for your gaming skills</div>
                </div>
                <div class="feature">
                    <div class="feature-title">🏅 Unlock Achievements</div>
                    <div>Collect badges and achievements as you progress</div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://clutchzone.com/tournaments" class="btn">Join Your First Tournament</a>
            </div>
            
            <div class="footer">
                <p>Thank you for joining ClutchZone!</p>
                <p>Follow us on social media for updates and exclusive content</p>
                <p>Questions? Contact us at support@clutchzone.com</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Welcome to ClutchZone, {username}!
    
    🏆 Your elite gaming journey starts here!
    
    You've earned +100 XP as a welcome bonus!
    
    What you can do on ClutchZone:
    • Join tournaments across multiple games
    • Track your progress and ranking
    • Win real money and prizes
    • Unlock achievements and badges
    
    Ready to start? Join your first tournament:
    https://clutchzone.com/tournaments
    
    Thank you for joining ClutchZone!
    
    Questions? Contact us at support@clutchzone.com
    """
    
    return subject, html_content, text_content

def get_tournament_reminder_template(username: str, tournament_name: str, 
                                   start_time: datetime, time_until: str) -> tuple[str, str, str]:
    """Get tournament reminder email template"""
    subject = f"⏰ Tournament Reminder: {tournament_name} starts in {time_until}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tournament Reminder</title>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
                color: #ffffff;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 40px;
                border: 1px solid rgba(255, 170, 0, 0.3);
            }}
            .header {{
                text-align: center;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 2rem;
                font-weight: bold;
                background: linear-gradient(45deg, #00ffff, #ff6b35);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }}
            .alarm {{
                font-size: 4rem;
                margin: 20px 0;
            }}
            .title {{
                font-size: 2rem;
                margin-bottom: 10px;
                color: #ffaa00;
            }}
            .tournament-info {{
                background: rgba(255, 170, 0, 0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid rgba(255, 170, 0, 0.3);
            }}
            .info-row {{
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
            }}
            .info-label {{
                font-weight: bold;
                color: #ffaa00;
            }}
            .btn {{
                display: inline-block;
                background: linear-gradient(45deg, #ffaa00, #ff6b35);
                color: #000;
                padding: 15px 30px;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
            }}
            .footer {{
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: #b0b0b0;
                font-size: 0.9rem;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ClutchZone</div>
                <div class="alarm">⏰</div>
                <h1 class="title">Tournament Reminder</h1>
            </div>
            
            <div class="tournament-info">
                <h2 style="color: #ffaa00; margin-top: 0;">{tournament_name}</h2>
                <div class="info-row">
                    <span class="info-label">Player:</span>
                    <span>{username}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Starts In:</span>
                    <span>{time_until}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Start Time:</span>
                    <span>{start_time.strftime('%Y-%m-%d %H:%M UTC')}</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <p>Don't miss your chance to compete!</p>
                <a href="https://clutchzone.com/tournaments" class="btn">Join Tournament</a>
            </div>
            
            <div class="footer">
                <p>Good luck in the tournament!</p>
                <p>ClutchZone Team</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Tournament Reminder - ClutchZone
    
    Hi {username},
    
    ⏰ The tournament "{tournament_name}" starts in {time_until}!
    
    Tournament Details:
    • Player: {username}
    • Starts In: {time_until}
    • Start Time: {start_time.strftime('%Y-%m-%d %H:%M UTC')}
    
    Don't miss your chance to compete!
    
    Join Tournament: https://clutchzone.com/tournaments
    
    Good luck!
    ClutchZone Team
    """
    
    return subject, html_content, text_content

# Main email functions
async def send_welcome_email(to_email: str, username: str):
    """Send welcome email to new user"""
    subject, html_content, text_content = get_welcome_email_template(username)
    return await email_service.send_email(to_email, subject, html_content, text_content, username)

async def send_tournament_reminder(to_email: str, username: str, tournament_name: str, 
                                 start_time: datetime, time_until: str):
    """Send tournament reminder email"""
    subject, html_content, text_content = get_tournament_reminder_template(
        username, tournament_name, start_time, time_until
    )
    return await email_service.send_email(to_email, subject, html_content, text_content, username)

async def send_tournament_results(to_email: str, username: str, tournament_name: str, 
                                rank: int, prize_amount: float = 0.0):
    """Send tournament results email"""
    subject = f"🏆 Tournament Results: {tournament_name}"
    
    prize_text = f"Prize: ${prize_amount:.2f}" if prize_amount > 0 else "No prize this time"
    
    html_content = f"""
    <h1>Tournament Results</h1>
    <p>Hi {username},</p>
    <p>The tournament "{tournament_name}" has ended!</p>
    <p><strong>Your Rank: #{rank}</strong></p>
    <p><strong>{prize_text}</strong></p>
    <p>Thanks for participating!</p>
    <p>ClutchZone Team</p>
    """
    
    text_content = f"""
    Tournament Results - ClutchZone
    
    Hi {username},
    
    The tournament "{tournament_name}" has ended!
    
    Your Rank: #{rank}
    {prize_text}
    
    Thanks for participating!
    ClutchZone Team
    """
    
    return await email_service.send_email(to_email, subject, html_content, text_content, username)

async def send_payout_confirmation(to_email: str, username: str, amount: float, 
                                 transaction_id: str):
    """Send payout confirmation email"""
    subject = f"💰 Payout Confirmation: ${amount:.2f}"
    
    html_content = f"""
    <h1>Payout Confirmation</h1>
    <p>Hi {username},</p>
    <p>Your payout has been processed successfully!</p>
    <p><strong>Amount: ${amount:.2f}</strong></p>
    <p><strong>Transaction ID: {transaction_id}</strong></p>
    <p>Thanks for being part of ClutchZone!</p>
    <p>ClutchZone Team</p>
    """
    
    text_content = f"""
    Payout Confirmation - ClutchZone
    
    Hi {username},
    
    Your payout has been processed successfully!
    
    Amount: ${amount:.2f}
    Transaction ID: {transaction_id}
    
    Thanks for being part of ClutchZone!
    ClutchZone Team
    """
    
    return await email_service.send_email(to_email, subject, html_content, text_content, username)
