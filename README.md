# edit-numbers

Edit (serial) numbers in the editor.  

![demo](https://raw.githubusercontent.com/BlueSilverCat/edit-numbers/master/demo.gif?raw=true)  

# Basic useage

1.  Toggle package to open panel.
2.  Input search conditions and output conditions.
3.  Push `mark` button to highlight target numbers.
4.  Push `edit` button to edit one by one, or push `editAll` button to edit at once.

# Panel

![panel](https://raw.githubusercontent.com/BlueSilverCat/edit-numbers/master/panel.png?raw=true)  

-   1st line. display area.
    -   `replace string area`  
        Indicate the replace string.  
    -   `close button`  
        Close this panel.
-   2nd line. operation buttons.  
    -   `edit type selector`  
        Select a edit type.  
        -   `overwrite`  
            Overwrite matching numbers by output numbers.  
        -   `insert`  
            Insert output numbers to between matching prefix and matching suffix.  
        -   `modify`  
            Modify matching numbers by arithmetic options.  
    -   `mark buton`  
        Highlight all matching numbers.  
    -   `first button`  
        Select a first matching number.
    -   `previous button`  
        Select a previous matching number.  
    -   `middile button`  
        Select a middle matching number.  
    -   `next button`  
        Select a next matching number.  
    -   `last button`  
        Select a last matching number.  
    -   `edit button`  
        Replace a selected number.  
    -   `edit all button`  
        Replace all matching numbers.  
    -   `new line input`  
        Input a new line number.  
    -   `new line button`  
        Append new lines to file tail with the number of `new line input`.  
    -   `save default button`  
        Set all current conditions to default values.  
    -   `load default button`  
        Reset all conditions to default value.  
-   3rd line. search conditions.  
    -   `prefix input`  
        Input a search prefix. Regular expression.
    -   `suffix input`  
        Input a search suffix. Regular expression.  
    -   `ignore case checker`  
        Indicate that a search should ignore case sensitivity.  
-   4th line. search target conditions.
    -   `target padding character input`  
        Input target numbers padding character(s).  
    -   `target sign selector`  
        Select a target numbers sign type.
        -   `minus`  
            Match for unsigned numbers or minus sign numbers.
        -   `plus`  
            Match for plus sign numbers or minus sign numbers.
        -   `space`  
            Match for numbers with leading a blank or minus sign numbers.
        -   `none`  
            Match for unsigned numbers.
    -   `target align selector`  
        Select a target align type.  
        -   `right`  
        -   `left`  
        -   `right_lead_sign`  
            sign put to start of string.  
    -   `target radix selector`  
        Select a target number radix.  
        -   `decimal`  
        -   `hexadecimal`  
    -   `target case selector`  
        Select a target number case.  
        If `target radix selector` is set to `decimal`, this is read only.  
        -   `both`  
            Match for lowercase and uppercase.
        -   `lower`  
        -   `upper`  
    -   `use custom target checker`  
        Indicate whether to use custom target.  
    -   `custom target input`  
        Input a search target number keyword. Regular expression.  
        If `use custom target checker` is not checked, this is read only.  
-   5th line. output formats  
    -   `digits input`  
        Input a output numbers digits.  
        If output numbers digits lower than this, output number is padding with `padding character`.  
    -   `padding character input`  
        Input output numbers padding character(s).  
    -   `sign selector`  
        Select a output numbers sign type.
        -   `minus`  
            Indicates that a sign should be used only for negative numbers.
        -   `plus`  
            Indicates that a sign should be used for both positive as well as negative numbers.
        -   `space`  
            Indicates that a leading space should be used on positive numbers, and a minus sign on negative numbers.
    -   `align selector`  
        Select a output numbers align type.  
        -   `right`  
        -   `left`  
        -   `right_lead_sign`  
            sign put to start of string.  
            e.g. digits=4, paddingChar=`*`, result =`-**1`  
    -   `output radix selector`  
        Select a output numbers radix.  
        -   `decimal`  
        -   `hexadecimal`  
    -   `upper case checker`  
        Indicate that output hexadecimal numbers are lower/upper case letter.  
-   6th line. arithmetic options  
    -   `start input`  
        Input a start number.  
        Output numbers are start from this number.  
    -   `end input`  
        Input a end number.  
        Output numbers are end by this number.  
    -   `increment input`  
        Input a increment number.  
        Next output number is incremented by this number.  
    -   `add input`  
        Input a add number.  
        Output numbers are added to this number.  
    -   `multiply input`  
        Input a multiply number.  
        Output numbers are multiplied by this number.  

# Settings

-   Auto Focus  
    Indicate whether or not to autofocus.  
-   Auto Focus Position  
    Indicate the position to be autofocused.  
-   defaultValue  
    Indicate each default values.  

# KeyBindings

Default keybindings

| Keystroke | Command                    | Selector           | Description                               |
| :-------- | :------------------------- | :----------------- | :---------------------------------------- |
| F12       | edit-numbers:toggle        | atom-workspace     | Open/close panel. (Activate package)      |
| none      | edit-numbers:settings      | atom-workspace     | Open package settings. (Activate package) |
| tab       | edit-numbers:focusNext     | .edit-numbers.root | Focus next panel element.                 |
| shift-tab | edit-numbers:focusPrevious | .edit-numbers.root | Focus previous panel element.             |
| pageup    | edit-numbers:previous      | .edit-numbers.root | Focus previous matching number.           |
| pagedown  | edit-numbers:next          | .edit-numbers.root | Focus next matching number.               |
| insert    | edit-numbers:mark          | .edit-numbers.root | Highlight all matching numbers.           |
| home      | edit-numbers:editAll       | .edit-numbers.root | Replace all matching numbers.             |
| end       | edit-numbers:edit          | .edit-numbers.root | Replace a selected number.                |
| escape    | none                       | none               | Close panel.                              |

# Examples

## case1

Input text is as below.

```text
2
1
4
3
6
5
8
10
7
9
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
digits = 1, paddingChar = '0', sign = 'minus', align = 'right', radix = 'decimal', upperCase=true  
**start = -2**, **end = 5**, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
-2
-1
0
1
2
3
4
5
-2
-1
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
**digits = 4**, **paddingChar = ' '**, sign = 'minus', align = 'right', radix = 'decimal', upperCase=true  
start = -2, end = 5, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
  -2
  -1
   0
   1
   2
   3
   4
   5
  -2
  -1
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
digits = 4, paddingChar = ' ', **sign = 'plus'**, align = 'right', radix = 'decimal', upperCase=true  
start = -2, end = 5, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
  -2
  -1
  +0
  +1
  +2
  +3
  +4
  +5
  -2
  -1
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
digits = 4, **paddingChar = '\*'**, **sign = 'space'**, align = 'right', radix = 'decimal', upperCase=true  
start = -2, end = 5, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
**-2
**-1
** 0
** 1
** 2
** 3
** 4
** 5
**-2
**-1
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
digits = 4, **paddingChar = ' '**, **sign = 'minus'**, **align = 'right_lead_sign'**, radix = 'decimal', upperCase=true  
start = -2, end = 5, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
-  2
-  1
   0
   1
   2
   3
   4
   5
-  2
-  1
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
digits = 4, **paddingChar = '\*'**, sign = 'minus', **align = 'left'**, radix = 'decimal', upperCase=true  
start = -2, end = 5, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
-2**
-1**
0***
1***
2***
3***
4***
5***
-2**
-1**
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
digits = 4, **paddingChar = '0'**, sign = 'minus', **align = 'right'**, **radix = 'hexadecimal'**, upperCase=true  
**start = 8**, **end = 0**, **increment = 2**, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
0008
000A
000C
000E
0010
0012
0014
0016
0018
001A
```

editType = 'overwrite'  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
digits = 4, paddingChar = '0', sign = 'minus', align = 'right', radix = 'hexadecimal', **upperCase=false**  
start = 8, end = 0, increment = 2, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
0008
000a
000c
000e
0010
0012
0014
0016
0018
001a
```

## case2

Input text is as below.

```text
0008
000A
000C
000E
0010
0012
0014
0016
0018
001A
```

**editType = 'modify'**  
prefix = '', suffix = '', ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  **targetRadix = 'hexadecimal'**, targetCase = 'both', useCustom = false  
**digits = 4**, **paddingChar = ' '**, sign = 'minus', align = 'right', radix = 'hexadecimal', upperCase=true  
start = 0, end = 0, **increment = 0**, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
   8
  10
  12
  14
  16
  18
  20
  22
  24
  26
```

## case3

Input text is as below.

```text
00-5
00-4
00-3
00-2
00-1
0000
0001
0002
0003
0004
0005
```

**editType = 'modify'**  
**prefix = '^'**, **suffix = '$'**, ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
**digits = 4**, **paddingChar = ' '**, sign = 'minus', **align = 'right_lead_sign'**, radix = 'decimal', upperCase=true  
start = 0, end = 0, **increment = 0**, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
-  5
-  4
-  3
-  2
-  1
   0
   1
   2
   3
   4
   5
```

## case4

Input text is as below.

```text
-5**
-4**
-3**
-2**
-1**
 0**
 1**
 2**
 3**
 4**
 5**
```

**editType = 'modify'**  
**prefix = '^'**, **suffix = '$'**, ignoreCase=false  
**targetPadding = '\*'**, **targetSign = 'space'**, **targetAlign = 'left'**,  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
**digits = 4**, paddingChar = '0', sign = 'minus', **align = 'right_lead_sign'**, radix = 'decimal', upperCase=true  
start = 0, end = 0, **increment = 0**, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
-005
-004
-003
-002
-001
0000
0001
0002
0003
0004
0005
```

## case5

Input text is as below.

```text
0008
000B
000E
0011
0014
0017
001A
001D
0020
0023
```

**editType = 'modify'**  
**prefix = '^'**, **suffix = '$'**, ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  **targetRadix = 'hexadecimal'**, targetCase = 'both', useCustom = false  
**digits = 4**, paddingChar = '0', sign = 'minus', align = 'right', radix = 'decimal', upperCase=true  
start = 0, end = 0, **increment = 0**, **add = 100**, **multiply = 2**  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
0116
0122
0128
0134
0140
0146
0152
0158
0164
0170
```

## case6

input text is empty.

1.  Input 10 to new line input.
2.  Push newLine button.

```text










```

**editType = 'insert'**  
**prefix = '^'**, **suffix = '$'**, ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
**digits = 4**, paddingChar = '0', sign = 'minus', align = 'right', **radix = 'hexadecimal'**, upperCase=true  
**start = 1**, end = 0, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
0001
0002
0003
0004
0005
0006
0007
0008
0009
000A
```

## case7

Input text is as below.

```text
Num 000 Data1 Price Note
Num 000 Data2 Price Note
Num 000 Data3 Price Note
Num 000 Data4 Price Note
Num 000 Data5 Price Note
Num 000 Data6 Price Note
Num 000 Data7 Price Note
```

**editType = 'overwrite'**  
**prefix = 'num '**, suffix = '', **ignoreCase=true**  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
**digits = 6**, paddingChar = '0', sign = 'minus', align = 'right', radix = 'decimal', upperCase=true  
start = 0, end = 0, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
Num 000000 Data1 Price Note
Num 000001 Data2 Price Note
Num 000002 Data3 Price Note
Num 000003 Data4 Price Note
Num 000004 Data5 Price Note
Num 000005 Data6 Price Note
Num 000006 Data7 Price Note
```

## case8

Input text is as below.

```text
Num 000000 Data1 Price Note
Num 000001 Data2 Price Note
Num 000002 Data3 Price Note
Num 000003 Data4 Price Note
Num 000004 Data5 Price Note
Num 000005 Data6 Price Note
Num 000006 Data7 Price Note
```

**editType = 'insert'**  
**prefix = 'data. '**, **suffix = 'price'**, **ignoreCase=true**  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  targetRadix = 'decimal', targetCase = 'both', useCustom = false  
**digits = 2**, paddingChar = '0', sign = 'minus', align = 'right', radix = 'decimal', upperCase=true  
start = 0, end = 0, **increment = 0**, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
Num 000000 Data1 00Price0 Note
Num 000001 Data2 00Price1 Note
Num 000002 Data3 00Price2 Note
Num 000003 Data4 00Price3 Note
Num 000004 Data5 00Price4 Note
Num 000005 Data6 00Price5 Note
Num 000006 Data7 00Price6 Note
```

## case9

Input text is as below.

```text
  :
01:
02:
  :
  :
03:
04:
05:
  :
06:
FF:
FE:
  :
0a:
13:
```

**editType = 'overwrite'**  
**prefix = '^'**, **suffix = ':'**, ignoreCase=false  
targetPadding = '0', targetSign = 'minus', targetAlign = 'right',  
  **targetRadix = 'hexadecimal'**, targetCase = 'both', **useCustom = true**, **customTarget='0\*-?[0-9a-fA-F]+|(  )'**  
**digits = 2**, paddingChar = '0', sign = 'minus', align = 'right', **radix = 'hexadecimal'**, upperCase=true  
start = 0, end = 0, increment = 1, add = 0, multiply = 1  

Change conditions as above then push `editAll` button.  
Then the result is as below.

```text
01:
02:
03:
04:
05:
06:
07:
08:
09:
0A:
0B:
0C:
0D:
0E:
0F:
```
