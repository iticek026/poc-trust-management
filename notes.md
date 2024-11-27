### Suggestions

- [x] there should be system/controller on the top level that transfers information to other robots, e.g. which sides are of searched object are occupied. The robot receives the info and then it can compare it is true, let say tha mal. robot occipies other side that it reported, then the robots can verify it and report it.
- [x] create parsing controller that will parse the information from the robots, there will be defined knows keywords that robots store and it can modify their behaviour
- [x] save swhich robots are occupying which sides of the object
- [/] final destination for robot is not where is the final destination for object, I should adjust the final destination for robots
- [x] when transporting check the invironment, if new object is detected recreate the path
- [x] during transporting the robot are circulating sometimes, probably the steps are not reseted correctly
- [x] trust
  - [x] swarm trust initialization
  - [x] Trust score erosion
    - [x] checkf in robot to robot communication
    - [x] check duration from last interaction -> in authority
  - [x] Trust decision
  - [x] Threshold θmn
  - [x] Direct trust Td
  - [x] Indirect trust Ti
  - [x] Member deactivation
  - [x] Malicious member
    - [/] create a movement controller
    - [/] create a communication controller
    - [/] create a detection controller
  - [x] refine calculateTrustLevel, in trust calculation there is not used previous trust score
  - [x] update authority trust level
  - [x] robot communication should happend only once on interserction
  - [x] more interaction events
  - [x] if robot doest not trust robot, also store the interactions and trust score
- [x] robots start in base
- [x] JSON config wiring
- [x] propagate consts from JSON config
- [x] UI
  - [x] layout
  - [/] colors
  - [x] grid map -> show mission info
  - [x] button for applying changes in config
- [x] after mission finished, stop timer
- [x] show malicious robot in different color, also reflect in left side menu
- [x] handle clearing all intervals
- [x] mal robot is increasing trust score when it is sending MOVE_TO_LOCATION but it should not => FIX: handle differently message types in makeTrustDecision function -> currently it is evaluated as true, but should be false,
- [x] replacing malicous robot in transporting if it was detected
- [x] malicious robot has for some reason some positive interactions, check it why -> the positive interactions are because of the average
- [x] when missing is in transporting phase it should not affect other robots that are searching, they should continue with searchind the environment and its state should not be affected by mission state change
- [x] when robot is excluded from swarm cancel all interactions with him
- [x] if replanned path, delete prev path from map
- [/] test context data
- [x] improve athority trust level calculation -> currently when it comes negative interaction as first it is ignored by all and it can't be recovered -> it is ok because initialy robots doest not build trust so they dont trust each other so they are not responding to messages, if they would build some trust they would interact
- [x] improve context data
  - [x] total namber of robots
  - [x] detected malicous robots
  - [x] wasObjectFound
- [x] if innsufficient number of robot to tranport item, return them to base
- [x] remove Robot word at authority in left panel
- [x] change expand collpase icons
- [x] enable to set up disabling point robots from authority
- [x] enabnle to set up robot radius
- [x] download file
- [x] obstacle avoidance pokud je prekazka blizko hrany
- [x] when no path found, returnt to base
- [x] separate observation messge type from other messagess
- [x] remove leader report status
- [x] malicious robot should also go to search item when it is found
- [x] use localization type message to send robots to specific location not move to position
- [x] enable extend json editor
- [x] turn on and off the trust erosion
- [x] pridelat seedy nebo udelat vice behu a zjistit prumerny vysledek
- [x] sometimse mal robot is not realeased from transporting and another is not called for help

  27.10.2024

- [x] randomize the position response for malicious robot and pushing object -> parametricky nastavitelne
- [x] create logger for every interaction
- [x] implement enabling sending messages based on trust score - from 27.10.2024

  28.10.2024

- [ ] investigate trust updates
- [x] investigate context informations

- [x] enable to use data from last run - from 27.10.2024
- [ ] need save button for ending trust scores -> should output similar file to config file
- [ ] config - reset button to default
- [/] buton for apply exported changes
- [x] udelat moznost, ze robot bude v jedne misi malicous a v druhe ne

- [/] take a look to 5.3 chapter in diploma and consider also that - from 27.10.2024

= rebular and mal robots report status in the same way, same bias, the mal have also coeficioent when they not respond

Backlog

- [x] when malicous robot report to malicious robot, it should higher their reputation score between them
- [x] malicious robot should lower trust score of other nonmalicious robots and report that to CA

- [/] reward and punishement
- [/] section for showing all run logs and selecting which to download
- [/] make how much the malicious robots can lie
- [ ] damaging regular robots

- [x] input for graph granularity
- [x] fix movement
- [x] validation that only one leader can be present
- [ ] add sendint robot which has higher truist score then constant A, leader wil send them to the location
- [/] remove if message is send by leader it is dogmatical
- [/] if robot should be disconnected add also check from leader if ti has low value
- [x] change implementation of past experience -> just apply erosion

- [ ] graphs

  - [x] by malicious/regular
  - [x] by phase - search, transport
  - [x] context info
  - [ ] number of send messages corelated to trust update

- [x] apply weight to analytics trust scores - e.g indirect trust

- [x] add compering of 2 runs -> another tab in analysis -> 2 select boxes for runs -> 2 columns
- [x] add naming runs

- [/] pridat pocet procent kdy jeko pravdepodobnost ze dokonci misi
- [x] when malicious robot intersect regular that is trasporting, the regular robot is increasing its trust score, which should not happen

- [ ] trust erosion vs without trust erosion - 1 run
- [ ] how fast finish the mission in case the robot push from side - 10 runs and compare
- [ ] number of received and accepted messages from malicious robots -> lne graph - 1 line all messages, line two accepted messages from mal, x axis is time

GOAL

- [/] validace hypotez

- leaders messages should be automatically accepted or not?
- ukladat si configurace a vsechy vysledky testu, udealt protokol

// 1730962379082