import copy
import requests
import json

def json2string(data):
    data = json.dumps(data, sort_keys=True, indent=4, separators=(',', ':'))
    return data

def write(text, filename = 'output.txt', encodings = 'utf-8'):
    fp = open(filename,"w", encoding=encodings)
    fp.write(text)
    fp.close()

def replace(targetList, origin, new):
    return [new if i == origin else i for i in targetList]

def replace_dict(targetList, dict):
    out = copy.deepcopy(targetList)
    for d in dict:
        target = dict[d]
        out = replace(out, d, target)
    return out

def L2S(list):
    out = ''
    for l in list:
        out += str(l)
    return out

class auto_url():
    def __init__(self, patternList, lastURL = None):
        '''
            pattern List is simply list of patterns
        '''
        self.patternList = patternList
        self.lastURL = lastURL

    def generate(self, dict = None):
        if dict is not None:
            data = replace_dict(self.patternList, dict)
        else:
            data = self.patternList
        data = L2S(data)
        self.lastURL = data
        return data

    def view(self):
        return self.patternList

    def get(self, filename = 'output.txt', url = None):
        if url is not None:
            return requests.get(url)
        if self.lastURL is not None:
            return requests.get(self.lastURL)
        return None
    
    def last(self):
        return self.lastURL