#ifndef PROGRESSBOX_H
#define PROGRESSBOX_H

#include <windows.h>

extern HWND g_progressBox;
extern int  g_doPaint;

INT_PTR CALLBACK ProgressBoxProc(HWND hwndDlg, UINT uMsg, WPARAM wParam, LPARAM lParam);

#endif // PROGRESSBOX_H
