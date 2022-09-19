"""
Get enrolment data from CSE for COMP courses 
and write hashed zIDs to backend/data/final_data/enrolmentData.json
(Note that a file of raw zIDs is also created at backend/data/final_data/enrolmentDataRaw.json
but it shouldn't be used and should be included in .gitignore)

Usage:
In the backend folder run:
    python3 runprocessors.py --type=enrolment --stage=scrape --username=z5555555 --password=abc123
"""

import subprocess
import paramiko
import argparse
import hashlib
import waiting #type: ignore
import re

from data.utility.data_helpers import read_data, write_data

COURSE_CODES_INPUT_PATH = "data/final_data/coursesProcessed.json"
ENROLMENT_DATA_OUTPUT_PATH = "data/scrapers/enrolmentDataRaw.json"
HASHED_ENROLMENT_DATA_OUTPUT_PATH = "data/final_data/enrolmentData.json"
MAX_BYTES = 2**32



def scrape_enrolment_data(username:str, password:str):
    data = read_data(COURSE_CODES_INPUT_PATH)
    enrolment_data = {}
    hashed_enrolment_data = {}
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect('login.cse.unsw.edu.au', username=username, password=password)
        stdin, stdout, stderr = ssh.exec_command('ls', timeout=1)
    except paramiko.ssh_exception.AuthenticationException:
        print('Authentication failed')
        exit(1)
    except paramiko.ssh_exception.SSHException:
        print('SSH failed')
        exit(1)

    stdin, stdout, stderr = ssh.exec_command(f'ls\n', timeout=1)
    #stdout.channel.set_combine_stderr(True)
    for course_code in data:
        if not course_code.startswith("COMP"):
            continue
        print(course_code)
        try:
            waiting.wait(lambda: stdin.channel.send_ready(), timeout_seconds=13)
            stdin.channel.sendall(f'members {course_code}_Student\n'.encode())

            waiting.wait(lambda: stdout.channel.recv_ready(), timeout_seconds=13)
            result = stdout.channel.recv(MAX_BYTES).decode('utf-8')

            enrolments = [res.split(' ')[0] for res in result.split('\n') if re.match(r'[0-9]{7}', res)]

            enrolment_data[course_code] = enrolments
            hashed_enrolment_data[course_code] = list(map(lambda s: hashlib.sha256(s.encode('utf-8')).hexdigest(), enrolments))
        except waiting.exceptions.TimeoutExpired:
            print(f'Timeout expired {course_code}')
            continue
        print(enrolment_data[course_code])

    write_data(enrolment_data, ENROLMENT_DATA_OUTPUT_PATH)
    write_data(hashed_enrolment_data, HASHED_ENROLMENT_DATA_OUTPUT_PATH)
    ssh.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Scrape enrolment data')
    parser.add_argument('--username', type=str, help='username (zID) for the enrolment scraper', nargs='?', default=None)
    parser.add_argument('--password', type=str, help='password (zPass) for the enrolment scraper', nargs='?', default=None)
    args = parser.parse_args()
    scrape_enrolment_data(args.username, args.password)