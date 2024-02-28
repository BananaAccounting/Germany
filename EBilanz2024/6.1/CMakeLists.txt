cmake_minimum_required(VERSION 3.16)

project(6.1)
set(EXTENSION_ID "ch.banana.de.EBilanz61-SKR04-KapG")

set(BAN_QT_RCC $ENV{BAN_QT_RCC} CACHE FILEPATH "C:/users/win admin/AppData/Local/Programs/BananaPlusDev/rcc.exe")
set(BAN_EXE_PATH $ENV{BAN_EXE_PATH} CACHE FILEPATH "C:/users/win admin/AppData/Local/Programs/BananaPlusDev/BananaPlusDev.exe")

# This target is used to build the extension to a sbaa package
add_custom_target(${PROJECT_NAME}
    COMMAND ${BAN_QT_RCC} -o ${EXTENSION_ID}.sbaa --binary ${EXTENSION_ID}.qrc
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
    SOURCES ${EXTENSION_ID}.qrc
)
# This target is used to run the tests of the extension
add_custom_target(test
    COMMAND ${BAN_EXE_PATH} -cmd=runtestsapps -cmd_exit=1 -cmd_p1=${PROJECT_SOURCE_DIR}/${EXTENSION_ID}.sbaa -cmd_op=A
    WORKING_DIRECTORY ${PROJECT_SOURCE_DIR}
)
