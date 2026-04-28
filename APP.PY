from flask import Flask, request, render_template, jsonify, redirect, url_for, session
import time
from collections import defaultdict
from model import predict
from functools import wraps

app = Flask(__name__)
app.secret_key = 'sir_anwar_uzair_secret_2024'

ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'admin123'

ip_requests = defaultdict(list)
blocked_ips = set()
TIME_WINDOW = 5

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def get_count(ip):
    now = time.time()
    ip_requests[ip] = [t for t in ip_requests[ip] if now - t < TIME_WINDOW]
    ip_requests[ip].append(now)
    return len(ip_requests[ip])

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/check')
def check():
    ip = request.remote_addr
    if ip in blocked_ips:
        return "BLOCKED"
    count = get_count(ip)
    result = predict([count, TIME_WINDOW])
    if result == 1:
        blocked_ips.add(ip)
        status = "ATTACK DETECTED"
    else:
        status = "SAFE TRAFFIC"
    return f"{status} | IP: {ip} | Requests: {count}"

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('dashboard'))
        else:
            error = 'Invalid credentials. Try again.'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template("dashboard.html")

@app.route('/api')
@login_required
def api():
    now = time.time()
    data = {
        ip: len([t for t in times if now - t < TIME_WINDOW])
        for ip, times in ip_requests.items()
    }
    blocked = list(blocked_ips)
    return jsonify({"traffic": data, "blocked": blocked})

if __name__ == '__main__':
    print("Sir Anwar & Uzair Threats Running...")
    app.run(debug=True)