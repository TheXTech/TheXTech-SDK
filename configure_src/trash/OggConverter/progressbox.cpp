#include "progressbox.h"
#include "resource.h"

HWND g_progressBox;
int  g_doPaint=1;

INT_PTR CALLBACK ProgressBoxProc(HWND hwndDlg, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    (void)lParam;
    switch (uMsg)
    {
        case WM_COMMAND:
        {
            switch (LOWORD(wParam))
            {
                case IDOK:
                case IDCANCEL:
                {
                    EndDialog(hwndDlg, (INT_PTR) LOWORD(wParam));
                    return (INT_PTR) TRUE;
                }
            }
            break;
        }
        case WM_PAINT:
        {
            return (INT_PTR)g_doPaint;
        }
        case WM_INITDIALOG:
        {
            return (INT_PTR) TRUE;
        }
    }
    return (INT_PTR) FALSE;
}
