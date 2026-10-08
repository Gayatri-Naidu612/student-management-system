from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import re

app = Flask(__name__)
CORS(app)

DATABASE = 'database.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                roll_no TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                student_class TEXT NOT NULL,
                marks REAL NOT NULL,
                contact TEXT NOT NULL
            )
        ''')
        conn.commit()

@app.route('/api/students', methods=['GET'])
def get_students():
    search = request.args.get('search', '')
    conn = get_db()
    cursor = conn.cursor()
    if search:
        query = "SELECT * FROM students WHERE name LIKE ? OR roll_no LIKE ?"
        students = cursor.execute(query, (f'%{search}%', f'%{search}%')).fetchall()
    else:
        students = cursor.execute("SELECT * FROM students").fetchall()
    
    return jsonify([dict(student) for student in students]), 200

@app.route('/api/students/stats', methods=['GET'])
def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    total = cursor.execute("SELECT COUNT(*) FROM students").fetchone()[0]
    avg_marks = cursor.execute("SELECT AVG(marks) FROM students").fetchone()[0] or 0
    max_marks = cursor.execute("SELECT MAX(marks) FROM students").fetchone()[0] or 0
    return jsonify({
        'total': total,
        'avg_marks': round(avg_marks, 2),
        'max_marks': round(max_marks, 2)
    }), 200

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    roll_no = data.get('roll_no', '').strip()
    name = data.get('name', '').strip()
    student_class = data.get('student_class', '').strip()
    marks = data.get('marks')
    contact = data.get('contact', '').strip()

    if not all([roll_no, name, student_class, marks is not None, contact]):
        return jsonify({'error': 'All fields are required'}), 400

    if not re.match(r'^\d{10}$', contact):
        return jsonify({'error': 'Contact number must be exactly 10 digits'}), 400

    try:
        marks_val = float(marks)
        if marks_val < 0 or marks_val > 100:
            return jsonify({'error': 'Marks must be between 0 and 100'}), 400
    except ValueError:
        return jsonify({'error': 'Marks must be a valid number'}), 400

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO students (roll_no, name, student_class, marks, contact)
            VALUES (?, ?, ?, ?, ?)
        ''', (roll_no, name, student_class, marks_val, contact))
        conn.commit()
        return jsonify({'message': 'Student added successfully'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': f'Student with Roll Number "{roll_no}" already exists'}), 400

@app.route('/api/students/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.json
    name = data.get('name', '').strip()
    student_class = data.get('student_class', '').strip()
    marks = data.get('marks')
    contact = data.get('contact', '').strip()

    if not all([name, student_class, marks is not None, contact]):
        return jsonify({'error': 'All fields are required'}), 400

    if not re.match(r'^\d{10}$', contact):
        return jsonify({'error': 'Contact number must be exactly 10 digits'}), 400

    try:
        marks_val = float(marks)
        if marks_val < 0 or marks_val > 100:
            return jsonify({'error': 'Marks must be between 0 and 100'}), 400
    except ValueError:
        return jsonify({'error': 'Marks must be a valid number'}), 400

    conn = get_db()
    cursor = conn.cursor()
    
    existing = cursor.execute("SELECT * FROM students WHERE id = ?", (id,)).fetchone()
    if not existing:
        return jsonify({'error': 'Student record not found'}), 404

    cursor.execute('''
        UPDATE students
        SET name = ?, student_class = ?, marks = ?, contact = ?
        WHERE id = ?
    ''', (name, student_class, marks_val, contact, id))
    conn.commit()
    return jsonify({'message': 'Student updated successfully'}), 200

@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE id = ?", (id,))
    conn.commit()
    return jsonify({'message': 'Student deleted successfully'}), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)