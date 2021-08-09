export const codeSample = '\
#include <windows.h>\n\
#include <stdio.h>\n\
#include <stdbool.h>\n\
#include <time.h>\n\
#include "sounds.h"\n\
#include "utils.h"\n\
#include "emulator.h"\n\
#include "keys.h"\n\
#include "global.h"\n\
#include "semevtype.h"\n\
\n\
/*===============================VARS AND CONSTS=============================*/\n\
static const time_t wiggleStopTime    = 30000;\n\
static const time_t struggleStopTime  = 30000;\n\
static const time_t autoGenStopTime   = 45000;\n\
static const time_t warningDelayTime  = 5000;\n\
static time_t startTime, runTime;\n\
static HANDLE stopSem;\n\
static enum stopSemEv_t ssemEv;\n\
/*==================================FUNCTIONS================================*/\n\
void scriptsInit() {\n\
  stopSem = CreateSemaphoreA(NULL, 0, 1, NULL);\n\
  ssemEv = SSE_NOTHING;\n\
}\n\
\n\
void resetTime(void) {\n\
  startTime = millis();\n\
  runTime = 0;\n\
  ssemEv = SSE_RESET;\n\
  ReleaseSemaphore(stopSem, 1, NULL);\n\
}\n\
\n\
void stop(void) {\n\
  ssemEv = SSE_STOP;\n\
  ReleaseSemaphore(stopSem, 1, NULL);\n\
}\n\
\n\
void action(void) {\n\
  ssemEv = SSE_ACTION;\n\
  ReleaseSemaphore(stopSem, 1, NULL);\n\
}\n\
\n\
//X 1) printf, beep\n\
//X 2) run for n seconds then warning \n\
//X 3) run for n + p seconds then disable\n\
//X 4) press \'a\' and \'d\' buttons while running\n\
//_ 5) reset by middle mouse button\n\
//_ 6) stop by \'shift\' or \'ctrl\'\n\
void wiggle(void) {\n\
  printf("Wiggle script active\\n");\n\
  makeSound(S_SCRIPT_ENABLED);\n\
\n\
  const time_t wrngTime = wiggleStopTime - warningDelayTime;\n\
  bool warned = false;\n\
  active = true;\n\
\n\
  ssemEv = SSE_NOTHING;\n\
  startTime = millis();\n\
  runTime = 0;\n\
\n\
  while (runTime < wiggleStopTime) {\n\
    pressKey(KBK_A, 30);\n\
    pressKey(KBK_D, 30);\n\
    //Sleep(random(10, 50));\n\
    DWORD semRes = \n\
      WaitForSingleObject(stopSem, random(10, 50));\n\
\n\
    if (semRes == WAIT_OBJECT_0) {\n\
      if (ssemEv == SSE_STOP)\n\
        break;\n\
      else if (ssemEv == SSE_RESET) {\n\
        warned = false;\n\
        makeSound(S_SCRIPT_ENABLED);\n\
      }\n\
      ssemEv = SSE_NOTHING;\n\
    }\n\
\n\
    runTime = millis() - startTime;\n\
\n\
    if (runTime > wrngTime && !warned) {\n\
      warned = true;\n\
      makeSound(S_SCRIPT_ABOUT_TO_END);\n\
    }\n\
  }\n\
\n\
  active = false;\n\
  printf("Wiggle script disabled\\n");\n\
  makeSound(S_SCRIPT_DISABLED);\n\
}\n\
\n\
//X 1) printf, beep\n\
//X 2) run for n seconds then warning \n\
//X 3) run for n + p seconds then disable\n\
//X 4) press \'space\' button while running\n\
//_ 5) reset by middle mouse button\n\
//_ 6) stop by \'shift\' or \'ctrl\'\n\
void struggle(void) {\n\
  printf("Struggle script active\\n");\n\
  makeSound(S_SCRIPT_ENABLED);\n\
\n\
  const time_t wrngTime = struggleStopTime - warningDelayTime;\n\
  bool warned = false;\n\
  active = true;\n\
\n\
  ssemEv = SSE_NOTHING;\n\
  startTime = millis();\n\
  runTime = 0;\n\
\n\
  while (runTime < struggleStopTime) {\n\
    pressKey(KBK_SPACE, 30);\n\
    //Sleep(random(10, 50));\n\
    DWORD semRes =\n\
      WaitForSingleObject(stopSem, random(10, 50));\n\
\n\
    if (semRes == WAIT_OBJECT_0) {\n\
      if (ssemEv == SSE_STOP)\n\
        break;\n\
      else if (ssemEv == SSE_RESET) {\n\
        warned = false;\n\
        makeSound(S_SCRIPT_ENABLED);\n\
      }\n\
      ssemEv = SSE_NOTHING;\n\
    }\n\
\n\
    runTime = millis() - startTime;\n\
\n\
    if (runTime > wrngTime && !warned) {\n\
      warned = true;\n\
      makeSound(S_SCRIPT_ABOUT_TO_END);\n\
    }\n\
  }\n\
\n\
  active = false;\n\
  printf("Struggle script disabled\\n");\n\
  makeSound(S_SCRIPT_DISABLED);\n\
}\n\
\n\
//1)X printf\n\
//2)X disable if shift pressed\n\
//3)X detect if lmb is pressed\n\
//4)X press ctrl or lmb while running\n\
//5)X run until ctrl or lmb is pressed\n\
//    run at least for few sec if neither \n\
//    pressed.\n\
void becomeToxic(void) {\n\
  if (kbKeys[KBK_SHIFT]) return;\n\
\n\
  printf("Become toxic script active\\n");\n\
\n\
  const time_t stopTime = 500;\n\
  const time_t tBagTime = 60;\n\
  const time_t clickTime = 30;\n\
  const bool tBag = !msKeys[MSK_LEFT];\n\
  active = true;\n\
\n\
  if (tBag)\n\
    pressKey(KBK_CTRL, 125);\n\
\n\
  ssemEv = SSE_NOTHING;\n\
  startTime = millis();\n\
  runTime = 0;\n\
\n\
  while (runTime < stopTime || msKeys[MSK_LEFT]) {\n\
    if (tBag) {\n\
      pushKey(KBK_CTRL);\n\
      Sleep(tBagTime);\n\
      releaseKey(KBK_CTRL);\n\
      Sleep(tBagTime);\n\
    }\n\
    else {\n\
      pushMouseBtn(MSK_RIGHT);\n\
      Sleep(clickTime);\n\
      releaseMouseBtn(MSK_RIGHT);\n\
      Sleep(clickTime);\n\
    }\n\
\n\
    DWORD semRes =\n\
      WaitForSingleObject(stopSem, 0);\n\
    \n\
    if (semRes == WAIT_OBJECT_0 && ssemEv == SSE_STOP) {\n\
      break;\n\
      ssemEv = SSE_NOTHING;\n\
    }\n\
\n\
    runTime = millis() - startTime;\n\
  }\n\
\n\
  active = false;\n\
  printf("Become toxic script disable\\n");\n\
}\n\
\n\
//1)X printf, beep\n\
//2)X wait 500ms if shift or ctrl is pressed\n\
//3)X Hold lmb while running\n\
//4)X run for n sec then warning\n\
//5)X run for n+p sec then disable\n\
//6)_ disable if shift or ctrl is pressed\n\
//7)_ if lmb is pressed press \'space\' button\n\
//8)_ reset if mmb is pressed \n\
void autoGen(void) {\n\
  if (kbKeys[KBK_CTRL] || kbKeys[KBK_SHIFT])\n\
    Sleep(300);\n\
  if (kbKeys[KBK_CTRL] || kbKeys[KBK_SHIFT])\n\
    return;\n\
\n\
  printf("AutoGen script is active\\n");\n\
  makeSound(S_SCRIPT_ENABLED);\n\
\n\
  const time_t wrngTime = autoGenStopTime - warningDelayTime;\n\
  bool warned = false;\n\
  active = true;\n\
\n\
  ssemEv = SSE_NOTHING;\n\
  startTime = millis();\n\
  runTime = 0;\n\
\n\
  pushMouseBtn(MSK_LEFT);\n\
  while (runTime < autoGenStopTime) {\n\
    //Sleep(50);\n\
    DWORD semRes =\n\
      WaitForSingleObject(stopSem, 500);\n\
\n\
    if (semRes == WAIT_OBJECT_0) {\n\
      if (ssemEv == SSE_STOP) {\n\
        ssemEv = SSE_NOTHING;\n\
        ';
