

import openai
import json
import random
import pyttsx3
from dotenv import load_dotenv
import os
import speech_recognition as sr
import time
from datetime import timedelta


load_dotenv()
rec = sr.Recognizer()


# OpenAI API variables
API_KEY = os.getenv("API_KEY")
model = 'text-davinci-003'
openai.api_key = API_KEY


# Text to speech configuration
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)
engine.setProperty('rate', 120)

# Main programm loop variables
end = 0
loop_three_times = 0

# Welcome message
rr = "Welcome to the Chatbot "
engine.say(rr)
engine.runAndWait()


# Initial JSON string format
manic_symptoms = '''{
    "manic symptoms":{
        "elevated mood for more than one week" : -1,
        "elevated mood nearly everyday" : -1,
        "Inflated self-esteem or grandiosity" : -1,
        "Decreased need for sleep" : -1,
        "More talkative than usual or pressure to keep talking" : -1,
        "Flight of ideas or subjective experience that thoughts are racing" : -1,
        "Distractibility (i.e., attention too easily drawn to unimportant or irrelevant external stimuli)" : -1,
        "Increase in goal-directed activity (either socially, at work or school, or sexually) or psychomotor agitation" : -1,
        "Excessive involvement in activities that have a high potential for painful consequences (e.g., engaging in unrestrained buying sprees, sexual indiscretions, or foolish business investments)." : -1,
        "The mood disturbance is sufficiently severe to cause marked impairment in social or occupational functioning or to necessitate hospitalization to prevent harm to self or others, or there are psychotic features." : -1,
        "The episode is not attributable to the direct physiological effects of a substance (e.g., a drug of abuse, a medication, or other treatment) or another medical condition." : -1
    }
}'''

# First Answer samples (for test)
text = "I feel amazing! I have so much energy and my mind is racing with new ideas and plans. I have only slept a few hours, but I don t feel tired at all. I am excited to take on the world and accomplish all my goals. I have been talking a mile a minute and making lots of new friends. I am feeling so creative and productive, I don t think I ll ever come down from this high!"
text2 = "I didn't sleep recently "

# First question
questions = ["Have you ever had the opposite of depression , when you've been extremely happy , over the top , doing things out of character or talking too fast ?"]
random_question = random.choice(questions)
engine.say(random_question)
engine.runAndWait()
# Record first answer + answer duration
start_time = time.time()
with sr.Microphone() as mic:
    print('You can start talking now')
    audio = rec.listen(mic)
    print('Time is over')
end_time = time.time()
elapsed_time = end_time - start_time
total_duration = elapsed_time
# Voice recognition
try:
    text3 = rec.recognize_google(audio)
except:
    print('ERROR')

# First prompt sent
prompt2 = 'analyse this text "' + text3 + \
    '" and change the values of this json from -1 to 1 if the symptoms are present in the text or keep them -1 if you can not confirm if the symptoms are present \n' + manic_symptoms
# print("prompt :"+prompt2)
print("initial JSON :"+manic_symptoms)

# number of words for first answer
countOfWords = len(text3.split())


#
response = openai.Completion.create(
    #  prompt=prompt2,
    prompt='analyse this text "' + text3 +
    '"and change the values of this json from -1 to 1 if the symptoms are present in the text or keep them -1 if you can not confirm if the symptoms are present \n' + manic_symptoms,
    model=model,
    max_tokens=1500
)

# Initial response (in case of api errors)
print("response :")
print(response)

# First JSON response
print("first JSON response :"+response.choices[0].text)

# First response text to JSON
manic_symptoms = response.choices[0].text
data = json.loads(manic_symptoms)


# Symptoms check (End if all symtoms are checked OR looped 3 times)
while end == 0 or loop_three_times < 3:
    # 1 Test for elevated mood duration
    if (data['manic symptoms']['elevated mood for more than one week'] == -1):
        questions = ["For how long have you been dealing with this mood?",
                     "How long have you been feeling excessively energetic, excited, or euphoric?",
                     "How long has it been since you first noticed these symptoms of mania in your life?",
                     "Can you recall any specific periods in your life when you experienced manic symptoms for an extended period of time?",
                     "How long have you been experiencing symptoms such as racing thoughts, decreased need for sleep, or grandiosity?",
                     "Can you describe the longest period of time you have experienced manic symptoms, and how long ago was that?",
                     "How long have you been feeling irritable or agitated?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        print(random_question)
        # input2 = input(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time

        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='analyse this answer and tell either it says a period of time that is more than a week or not , if it is less than a  week answer "0" else if it is a week or more answer "1" , only answer by "0" or "1" , this is the answer :"' + input2+'"',
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['elevated mood for more than one week'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['elevated mood for more than one week'] = 1
        print(data)

    # 2 Test for elevated mood nearly everyday
    if (data['manic symptoms']['elevated mood nearly everyday'] == -1):
        questions = ["Can you describe how you feel on an average day, in terms of your mood and energy level?",
                     "Do you feel like your mood is consistently elevated, or does it fluctuate throughout the day?",
                     "Have you noticed any triggers or patterns to your elevated moods, such as particular times of day or certain situations?",
                     "Do you feel abnormally upbeat or happy for most of the day, nearly every day?",
                     "On average, how many hours each day do you feel like you are in an elevated mood?",
                     "How often do you feel overly happy or elated during the day?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        print(random_question)
        # input2 = input(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        countOfWords += len(input2.split())
        total_duration += elapsed_time
        print('considering this question :"'+random_question+'" and this  answer :"' + input2 +
              '" identify if the answer says if the person has an elevated mood for most of the day or not , if yes answer "1" if not answer "0" , only answer by 1 or 0')
        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='considering this question :"'+random_question+'" and this  answer :"' + input2 + \
            '" identify if the answer says if the person has an elevated mood for most of the day or not , if yes answer "1" if not answer "0" , only answer by 1 or 0',
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['elevated mood nearly everyday'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['elevated mood nearly everyday'] = 1
        print(data)

    # 3 Test for Inflated self-esteem or grandiosity
    if (data['manic symptoms']['Inflated self-esteem or grandiosity'] == -1):
        questions = ["How do you feel about yourself compared to others around you?",
                     "Have you been feeling more confident or empowered than usual lately?",
                     "Can you describe a recent experience where you felt particularly powerful or invincible?",
                     "What are your thoughts on your own intelligence or abilities?",
                     "How have your goals or aspirations changed recently?",
                     "How have people been reacting to your ideas or plans lately?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        print(random_question)
        # input2 = input(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify it he has inflated self-esteem or grandiosity , analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom ,only answer by 1 or 0, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Inflated self-esteem or grandiosity'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Inflated self-esteem or grandiosity'] = 1
        print(data)

    # 4 Test for Decreased need for sleep
    if (data['manic symptoms']['Decreased need for sleep'] == -1):
        questions = ["Have you been having trouble falling asleep at night? Or are you finding that you need less sleep than usual?",
                     "Have you been experiencing any racing thoughts or ideas lately? Do you find that your mind is racing at night when you're trying to sleep?",
                     "Have you noticed any changes in your sleep patterns, such as sleeping less or experiencing insomnia?",
                     "How many hours of sleep did you get last night?",
                     "Have you had any trouble falling or staying asleep?",
                     "Do you feel like you could function well without much sleep?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        # input2 = input(random_question)
        print(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify it he has less need for sleep than the average person , analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom ,only answer by 1 or 0, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Decreased need for sleep'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Decreased need for sleep'] = 1
        print(data)

    # 5 Test for More talkative than usual
    if (data['manic symptoms']['More talkative than usual or pressure to keep talking'] == -1):
        questions = ["Do you find it hard to stop talking?",
                     "Have you friends or family commented on the way you are talking?",
                     "Do you find yourself talking more than usual?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        # input2 = input(random_question)
        print(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify it he is more talktive than usual or pressure to keep talking , analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom or "-1" if you can not confirm nor deny ,only answer by 1 or 0 or -1, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Decreased need for sleep'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Decreased need for sleep'] = 1
        elif (response2.choices[0].text == "\n\n-1"):
            data['manic symptoms']['Decreased need for sleep'] = -1
        print(data)

    # 6 Test for Flight of ideas
    if (data['manic symptoms']['Flight of ideas or subjective experience that thoughts are racing'] == -1):
        questions = ["Do you find your thoughts racing?",
                     "Do you find it difficult to keep track of your thought?",
                     "Do your thoughts jump from place to place that makes it difficult for you to keep track of them?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        # input2 = input(random_question)
        print(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify it he has flight of ideas or subjective experience that thoughts are racing, analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom or "-1" if you can not confirm nor deny ,only answer by 1 or 0 or -1, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Decreased need for sleep'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Decreased need for sleep'] = 1
        elif (response2.choices[0].text == "\n\n-1"):
            data['manic symptoms']['Decreased need for sleep'] = -1
        print(data)

    # 7 Test for Distractibility (not working)
    if (data['manic symptoms']['Distractibility (i.e., attention too easily drawn to unimportant or irrelevant external stimuli)'] == -1):
        questions = ["Do you find your thoughts racing?",
                     "Do you find it difficult to keep track of your thought?",
                     "Do your thoughts jump from place to place that makes it difficult for you to keep track of them?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        # input2 = input(random_question)
        print(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify it he has flight of ideas or subjective experience that thoughts are racing, analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom or "-1" if you can not confirm nor deny ,only answer by 1 or 0 or -1, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Decreased need for sleep'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Decreased need for sleep'] = 1
        elif (response2.choices[0].text == "\n\n-1"):
            data['manic symptoms']['Decreased need for sleep'] = -1
        print(data)

    # 8 Test for Increase in goal-directed activity
    if (data['manic symptoms']['Increase in goal-directed activity (either socially, at work or school, or sexually) or psychomotor agitation'] == -1):
        questions = ["Have you taken on any new activities lately?",
                     "Have you come across any brilliant ideas lately?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        # input2 = input(random_question)
        print(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify any increase in goal-directed activity (either socially, at work or school, or sexually), analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom or "-1" if you can not confirm nor deny ,only answer by 1 or 0 or -1, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Decreased need for sleep'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Decreased need for sleep'] = 1
        elif (response2.choices[0].text == "\n\n-1"):
            data['manic symptoms']['Decreased need for sleep'] = -1
        print(data)

    # 9 Test for Excessive involvement in activities that have a high potential for painful consequence
    if (data['manic symptoms']['Excessive involvement in activities that have a high potential for painful consequences (e.g., engaging in unrestrained buying sprees, sexual indiscretions, or foolish business investments).'] == -1):
        questions = ["Have you been doing things that are out of character for you ?",
                     "Have you done things that were unusual for you or that other people might have thought were excessive, foolish, or risky?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        # input2 = input(random_question)
        print(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify any Excessive involvement in activities that have a high potential for painful consequences, analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom or "-1" if you can not confirm nor deny ,only answer by 1 or 0 or -1, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Decreased need for sleep'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Decreased need for sleep'] = 1
        elif (response2.choices[0].text == "\n\n-1"):
            data['manic symptoms']['Decreased need for sleep'] = -1
        print(data)

    # 11 Test for physiological effects of a substance
    if (data['manic symptoms']['The episode is not attributable to the direct physiological effects of a substance (e.g., a drug of abuse, a medication, or other treatment) or another medical condition.'] == -1):
        questions = ["Have you used any drugs or alcohol lately?",
                     "Have you been diagnosed with any medical conditions that could be causing these symptoms?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        # input2 = input(random_question)
        print(random_question)
        start_time = time.time()
        with sr.Microphone() as mic:
            print('You can start talking now')
            audio = rec.listen(mic)
            print('Time is over')
        # Voice recognition
        try:
            input2 = rec.recognize_google(audio)
        except:
            print('ERROR')
        print(input2)
        end_time = time.time()
        elapsed_time = end_time - start_time
        total_duration += elapsed_time
        countOfWords += len(input2.split())

        response2 = openai.Completion.create(

            #  prompt=prompt2,
            prompt='a person who could potentialy be in a manic episode got asked this question : "'+random_question + \
            '" trying to identify if the episode is not attributable to the direct physiological effects of a substance (e.g., a drug of abuse, a medication, or other treatment) or another medical condition , analyse the answer and answer by "0" if you couldn t identify the symptom or by "1" if you could identify the symptom or "-1" if you can not confirm nor deny ,only answer by 1 or 0 or -1, here is the answer :' + input2,
            model=model,
            max_tokens=10
        )
        print(response2.choices[0].text)
        if (response2.choices[0].text == "\n\n0"):
            data['manic symptoms']['Decreased need for sleep'] = 0
        elif (response2.choices[0].text == "\n\n1"):
            data['manic symptoms']['Decreased need for sleep'] = 1
        elif (response2.choices[0].text == "\n\n-1"):
            data['manic symptoms']['Decreased need for sleep'] = -1
        print(data)
    # check if symptoms are checked
    if (data['manic symptoms']['elevated mood for more than one week'] != -1
        and data['manic symptoms']['elevated mood nearly everyday'] != -1
        and data['manic symptoms']['Inflated self-esteem or grandiosity'] != -1
        and data['manic symptoms']['Decreased need for sleep'] != -1
        and data['manic symptoms']['More talkative than usual or pressure to keep talking'] != -1
        and data['manic symptoms']['Flight of ideas or subjective experience that thoughts are racing'] != -1
        and data['manic symptoms']['Increase in goal-directed activity (either socially, at work or school, or sexually) or psychomotor agitation'] != -1
        and data['manic symptoms']['Excessive involvement in activities that have a high potential for painful consequences (e.g., engaging in unrestrained buying sprees, sexual indiscretions, or foolish business investments).'] != -1
            and data['manic symptoms']['The episode is not attributable to the direct physiological effects of a substance (e.g., a drug of abuse, a medication, or other treatment) or another medical condition.'] != -1):
        end = 1

    # counter for number of loops
    loop_three_times += 1

print("Number of words is : " + str(countOfWords))
print("Speech duration in secconds : " + str(total_duration))
total_duration_minutes = total_duration / 60
print("Speech duration in minutes : " + str(total_duration_minutes))
speech_duration = timedelta(seconds=total_duration)
print("Speech duration HH:mm:ss -> "+str(speech_duration))
words_per_minute = countOfWords // total_duration_minutes
print("Words per minute : " + str(words_per_minute))
