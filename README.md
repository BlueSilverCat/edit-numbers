# edit-numbers

Edit (serial) numbers in the editor.  

![demo](https://raw.githubusercontent.com/BlueSilverCat/edit-numbers/master/demo.gif?raw=true)  

# Basic useage
1. Toggle package to open panel.
2. Input search conditions and output conditions.
3. Push `mark` button to highlight target numbers.
4. Push `edit` button to edit one by one, or push `editAll` button to edit at once.

# Panel

![panel](https://raw.githubusercontent.com/BlueSilverCat/edit-numbers/master/panel.png?raw=true)  

* search options  
  * prefix input  
    Input a search prefix.
    Regular expression.
  * suffix input  
    Input a search suffix.  
    Regular expression.  
  * ignore case checker  
    Indicate that a search should ignore case sensitivity.  
  * target type selector  
    Indicate that search decimal/hexadecimal/custom numbers.  
    * decimal  
    * hexadecimal  
    * custom  
  * custom target input  
    Input a search target number keyword.  
    Regular expression.  
    If target type selector is not `custom`, this is read only.  
* output options  
  * place input  
    Input a output number's place.  
    If output number's place lower than this, output number is padding with padding character.  
  * padding character input  
    Input padding character(s).  
  * align selector  
    Indicate align type.  
    * right  
    * left  
    * right_lead_minus  
    If output number is minus, minus sign put to start of string.  
    e.g. place=4, paddingChar=`_`, `-__1`  
  * output base selector  
    Indicate that output decimal/hexadecimal numbers.  
    * decimal  
    * hexadecimal  
  * upper case checker  
    Indicate that output hexadecimal numbers are lower/upper case letter.  
* arithmetic options  
  * start input  
    Input a start number.  
    Output numbers are start from this number.  
  * end input  
    Input a end number.  
    Output numbers are end by this number.  
  * increment input  
    Input a increment number.  
    Next output number is incremented by this number.  
  * add input  
    Input a add number.  
    Output numbers are added to this number.  
  * multiply input  
    Input a multiply number.  
    Output numbers are multiplied by this number.  
* display area
  * replace string area  
    Indicate the replace string.  
* operation buttons  
  * mark buton  
    Highlight all matching numbers.  
  * first button  
    Select a first matching number.  
  * middile button  
    Select a middle matching number.  
  * last button  
    Select a last matching number.  
  * previous button  
    Select a previous matching number.  
  * next button  
    Select a next matching number.  
  * edit type selector  
    Indicate edit type.  
    * overwrite  
      Overwrite matching numbers by output numbers.  
    * insert  
      Insert output numbers to between matching prefix and matching suffix.  
    * modify  
      Modify matching numbers by arithmetic options.  
  * edit button  
    Replace a selected number.  
  * edit all button  
    Replace all matching numbers.  
  * new line input  
    Input a new line number.  
  * new line button  
    Append new lines to file tail to the number of `new line input`.  

# Settings
* Auto Focus  
  Indicate whether or not to autofocus.  
* Auto Focus Position  
  Indicate the position to be autofocused.  
* defaultValue  
  Indicate each default value.  

# KeyBindings
Default keybindings

| Keystroke | Command | Selector | Description |
| :-- | :-- | :-- | :-- |
| F12 | edit-numbers:toggle | atom-workspace | Open/close panel. (Activate package) |
| none | edit-numbers:settings | atom-workspace | Open package settings. (Activate package) |
| tab | edit-numbers:focusNext | .edit-numbers.root | Forcus next panel element. |
| shift-tab | edit-numbers:focusPrevious | .edit-numbers.root | Forcus previous panel element. |
| pageup | edit-numbers:previous | .edit-numbers.root | Forcus previous matching number. |
| pagedown | edit-numbers:next | .edit-numbers.root | Forcus next matching number. |
| insert | edit-numbers:mark | .edit-numbers.root | Highlight all matching numbers. |
| home | edit-numbers:editAll | .edit-numbers.root | Replace all matching numbers. |
| end | edit-numbers:edit | .edit-numbers.root | Replace a selected number. |
| escape | none | none | Close panel. |

# Examples

## case1
text
```
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

prefix = '', suffix = '', targetType = 'decimal'  
place = 1, paddingChar = '', align = 'right', outputBase = 'decimal'  
**start = -2**, **end = 5**, increment = 1, add = 0, muliply = 1  
editType = 'overwrite'  
```
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

prefix = '', suffix = '', targetType = 'decimal'  
**place = 4**, **paddingChar = ' '**, align = 'right', outputBase = 'decimal'  
start = -2, end = 5, increment = 1, add = 0, muliply = 1  
editType = 'overwrite'  
```
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

prefix = '', suffix = '', targetType = 'decimal'  
place = 4, paddingChar = ' ', **align = 'right_lead_minus'**, outputBase = 'decimal'  
start = -2, end = 5, increment = 1, add = 0, muliply = 1  
editType = 'overwrite'  
```
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

prefix = '', suffix = '', targetType = 'decimal'  
place = 4, **paddingChar = '\*'**, **align = 'left'**, outputBase = 'decimal'  
start = -2, end = 5, increment = 1, add = 0, muliply = 1  
editType = 'overwrite'  
```
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

prefix = '', suffix = '', targetType = 'decimal'  
place = 4, **paddingChar = '0'**, **align = 'right'**, **outputBase = 'hexadecimal'**  
**start = 8**, **end = 0**, **increment = 2**, add = 0, muliply = 1  
editType = 'overwrite'  
```
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

prefix = '', suffix = '', targetType = 'decimal'  
place = 4, paddingChar = '0', align = 'right', outputBase = 'hexadecimal', **upperCase**  
start = 8, end = 0, increment = 2, add = 0, muliply = 1  
editType = 'overwrite'  
```
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

## case2
text
```
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

prefix = '', suffix = '', **targetType = 'hexadecimal'**,  
**place = 4**, **paddingChar = ' '**, align = 'right', outputBase = 'decimal',  
start = 0, end = 0, **increment = 0**, add = 0, muliply = 1  
**editType = 'modify'**  
```
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
text
```
   8
  11
  14
  17
  20
  23
  26
  29
  32
  35
```

prefix = '', suffix = '', **targetType = 'custom'**, **custom target = ' \*-?\d+'**  
**place = 4**, **paddingChar = '0'**, align = 'right', outputBase = 'decimal',  
start = 0, end = 0, **increment = 0**, **add = 100**, muliply = 1  
**editType = 'modify'**  
```
0108
0111
0114
0117
0120
0123
0126
0129
0132
0135
```

## case4
text
```
empty file.
```

1. Input 10 to new line input.
2. Push newLine button.

```











```

**prefix = '^'**, suffix = '', targetType = 'decimal'  
**place = 4**, **paddingChar = '0'**, align = 'right', **outputBase = 'hexadecimal'**, **upperCase**  
start = 0, end = 0, increment = 1, add = 0, muliply = 1  
**editType = 'insert'**  
```
0000
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

## case5
text
```
Num 000 Data1 Price Note
Num 000 Data2 Price Note
Num 000 Data3 Price Note
Num 000 Data4 Price Note
Num 000 Data5 Price Note
Num 000 Data6 Price Note
Num 000 Data7 Price Note
```

**prefix = 'num '**, suffix = '', **ignoreCase**, targetType = 'decimal'  
**place = 6**, **paddingChar = '0'**, align = 'right', outputBase = 'decimal',  
start = 0, end = 0, increment = 1, add = 0, muliply = 1  
editType = 'overwrite'  
```
Num 000000 Data1 Price Note
Num 000001 Data2 Price Note
Num 000002 Data3 Price Note
Num 000003 Data4 Price Note
Num 000004 Data5 Price Note
Num 000005 Data6 Price Note
Num 000006 Data7 Price Note
```

## case6
text
```
Num 000000 Data1 Price Note
Num 000001 Data2 Price Note
Num 000002 Data3 Price Note
Num 000003 Data4 Price Note
Num 000004 Data5 Price Note
Num 000005 Data6 Price Note
Num 000006 Data7 Price Note
```

**prefix = 'data.\* '**, **suffix = 'price'**, **ignoreCase**, targetType = 'decimal'  
**place = 2**, **paddingChar = '0'**, align = 'right', outputBase = 'decimal',  
start = 0, end = 0, **increment = 0**, add = 0, muliply = 1  
**editType = 'insert'**  
```
Num 000000 Data1 00Price0 Note
Num 000001 Data2 00Price1 Note
Num 000002 Data3 00Price2 Note
Num 000003 Data4 00Price3 Note
Num 000004 Data5 00Price4 Note
Num 000005 Data6 00Price5 Note
Num 000006 Data7 00Price6 Note
```
