v0.3.0
!IMPORTANT UPDATE!

-   Redesigned application (terminal, sftp, header)

-   Added drag n drop support for uploading files via sftp
-   Added automatic reconnection for ssh and sftp if the connection has been lost or wasn't established
-   Added file copy action for standalone sftp
-   Added file cut action for standalone sftp
-   Added connection to servers via header button
-   Added sorting SFTP list with no files/folders separation, by ctrl + click
-   Added settings migration
-   Added using OS Crypt for important settings
-   Added terminal context menu

-   Fixed display for remote terminal, now such commands as "htop" and others are displayed correctly
-   Fixed sftp ctrl + x event in input target
-   Fixed the focus returning to the sftp file during the renaming process, after pressing Escape or Enter, repeated presses of "F2" or other events (as "F5", "CTRL + R") were not being handled

-   Small UI/UX fixes
