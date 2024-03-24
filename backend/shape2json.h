#ifndef _SHAPE2JSON_H
#define _SHAPE2JSON_H
#ifdef __cplusplus
extern "C" {
#endif

int shape2json(char *inputFile, char *outputFile);
int fileExists(const char *filename);
void logE(char *message, char *step);
void logI(char *message, char *step);
void logD(char *message, char *step);

#ifdef __cplusplus
}
#endif
#endif
