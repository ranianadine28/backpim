

import openai
import json
import random
import pyttsx3


# OpenAI API variables
API_KEY = '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'
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


# First prompt sent
prompt2 = 'analyse this text "' + text2 + \
    '" and change the values of this json from -1 to 1 if the symptoms are present in the text or keep them -1 if you can not confirm if the symptoms are present \n' + manic_symptoms
# print("prompt :"+prompt2)
print("initial JSON :"+manic_symptoms)


#
response = openai.Completion.create(
    #  prompt=prompt2,
    prompt='analyse this text "' + text2 +
    '"and change the values of this json from -1 to 1 if the symptoms are present in the text or keep them -1 if you can not confirm if the symptoms are present \n' + manic_symptoms,
    model=model,
    max_tokens=1000
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
        input2 = input(random_question)

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
        input2 = input(random_question)
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
        input2 = input(random_question)
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
        input2 = input(random_question)
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

    # 4 Test for Decreased need for sleep
    if (data['manic symptoms']['Decreased need for sleep'] == -1):
        questions = ["Have you been having trouble falling asleep at night? Or are you finding that you need less sleep than usual?",
                     "Have you been experiencing any racing thoughts or ideas lately? Do you find that your mind is racing at night when you're trying to sleep?",
                     "Have you been experiencing any disruptions in your sleep lately? Are you waking up frequently or feeling more tired than usual during the day?",
                     "How many hours of sleep did you get last night?",
                     "Have you had any trouble falling or staying asleep?",
                     "Do you feel like you could function well without much sleep?"]
        random_question = random.choice(questions)
        engine.say(random_question)
        engine.runAndWait()
        input2 = input(random_question)
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

    # check if symptoms are checked
    if (data['manic symptoms']['elevated mood for more than one week'] != -1
        and data['manic symptoms']['elevated mood nearly everyday'] != -1
        and data['manic symptoms']['Inflated self-esteem or grandiosity'] != -1
            and data['manic symptoms']['Decreased need for sleep'] != -1):
        end = 1

    # counter for number of loops
    loop_three_times += 1
