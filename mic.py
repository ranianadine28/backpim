import speech_recognition as sr
import time
from datetime import timedelta

"""
rec = sr.Recognizer()

# voice recording
start_time = time.time()
with sr.Microphone() as mic:
    print('You can start talking now')
    audio = rec.listen(mic)
    print('Time is over')

end_time = time.time()

#  audio duration tests (not working)

data = audio.get_wav_data()
sample_rate = audio.sample_rate
duration = len(data) / float(sample_rate)
print('Duration of speech:', duration)

# voice recognition
try:
    print('Text: ' + rec.recognize_google(audio))
    text = rec.recognize_google(audio)
    # number of words
    countOfWords = len(text.split())
    print("Count of Words in the given Sentence22:", countOfWords)
except:
    print('It just exploded!!!')


# audio duration tests


elapsed_time = end_time - start_time
print("Elapsed time: ", elapsed_time, "seconds")
"""
sec = 98
delta = timedelta(seconds=sec)
print(delta)
