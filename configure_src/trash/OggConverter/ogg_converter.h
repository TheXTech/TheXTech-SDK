#ifndef OGG_CONVERTER_H
#define OGG_CONVERTER_H

#include <windows.h>
#include <string>

extern std::string appPath;

struct FTPUploaderWorker
{
    int state;
    bool upd;
    int range;
    int progress;
    std::string textLabel;
    std::string spawnMsg;
    std::string askQuestion;
    int askQuestion_reply;
    std::string targetFolder;
};

bool ConvertAllMP3sToOgg(std::string folder, HINSTANCE hInstance);

#endif // OGG_CONVERTER_H
