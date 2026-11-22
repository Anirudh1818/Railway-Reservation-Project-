/*
    RAILWAY RESERVATION SYSTEM
    C Programming Project - 12
    Concepts used : Arrays, Structures, File Handling

    Name : Piyush Kumar
*/

#include<stdio.h>
#include<string.h>
#include<ctype.h>

#define MAX 500      // max tickets that can be stored
#define SEATS 30     // seats in each train
#define TRAINS 5     // total no of trains

// structure for train
struct train{
    int no;
    char name[30];
    char from[20];
    char to[20];
    int fare;
};

// structure for ticket
struct ticket{
    int pnr;
    char name[50];
    int age;
    char gender;
    int trainNo;
    int seatNo;
    char date[20];
    int fare;
};

// list of trains
struct train tr[TRAINS] = {
    {12301, "Rajdhani Express", "Kolkata", "Delhi", 2450},
    {12951, "Mumbai Rajdhani", "Mumbai", "Delhi", 2300},
    {12011, "Kalka Shatabdi", "Delhi", "Kalka", 850},
    {12627, "Karnataka Express", "Bangalore", "Delhi", 1900},
    {12723, "Telangana Express", "Hyderabad", "Delhi", 1750}
};

struct ticket tk[MAX];   // all booked tickets
int n = 0;               // no of tickets
int lastPnr = 1000;      // pnr starts from 1001


// reads all tickets from file into the array
void loadData(){
    FILE *fp;
    fp = fopen("bookings.txt","r");
    if(fp==NULL){
        // first time running, file not made yet
        return;
    }
    while(fscanf(fp,"%d,%[^,],%d,%c,%d,%d,%[^,],%d\n",&tk[n].pnr,tk[n].name,&tk[n].age,&tk[n].gender,&tk[n].trainNo,&tk[n].seatNo,tk[n].date,&tk[n].fare)==8){
        if(tk[n].pnr > lastPnr)
            lastPnr = tk[n].pnr;
        n++;
        if(n==MAX)
            break;
    }
    fclose(fp);
}

// writes whole array back to the file
void saveData(){
    FILE *fp;
    int i;
    fp = fopen("bookings.txt","w");
    if(fp==NULL){
        printf("Error in opening file!!\n");
        return;
    }
    for(i=0;i<n;i++){
        fprintf(fp,"%d,%s,%d,%c,%d,%d,%s,%d\n",tk[i].pnr,tk[i].name,tk[i].age,tk[i].gender,tk[i].trainNo,tk[i].seatNo,tk[i].date,tk[i].fare);
    }
    fclose(fp);
}

// returns index of train in tr[] or -1
int findTrain(int tno){
    int i;
    for(i=0;i<TRAINS;i++){
        if(tr[i].no==tno)
            return i;
    }
    return -1;
}

void showTrains(){
    int i;
    printf("\n---------------------------------------------------------------\n");
    printf("%-10s %-20s %-11s %-10s %-6s\n","Train No","Train Name","From","To","Fare");
    printf("---------------------------------------------------------------\n");
    for(i=0;i<TRAINS;i++){
        printf("%-10d %-20s %-11s %-10s Rs %d\n",tr[i].no,tr[i].name,tr[i].from,tr[i].to,tr[i].fare);
    }
    printf("---------------------------------------------------------------\n");
    printf("Each train has %d seats\n",SEATS);
}

// gives first empty seat of the train on that date, -1 if full
int getSeat(int tno, char date[]){
    int booked[SEATS+1] = {0};   // booked[i]=1 means seat i is taken
    int i;
    for(i=0;i<n;i++){
        if(tk[i].trainNo==tno && strcmp(tk[i].date,date)==0)
            booked[tk[i].seatNo] = 1;
    }
    for(i=1;i<=SEATS;i++){
        if(booked[i]==0)
            return i;
    }
    return -1;
}

void printTicket(int i){
    int idx = findTrain(tk[i].trainNo);
    printf("\n----------------------------------------\n");
    printf("  PNR No     : %d\n",tk[i].pnr);
    printf("  Name       : %s\n",tk[i].name);
    printf("  Age/Gender : %d / %c\n",tk[i].age,tk[i].gender);
    printf("  Train      : %d - %s\n",tk[i].trainNo,tr[idx].name);
    printf("  Route      : %s to %s\n",tr[idx].from,tr[idx].to);
    printf("  Date       : %s\n",tk[i].date);
    printf("  Seat No    : %d\n",tk[i].seatNo);
    printf("  Fare       : Rs %d\n",tk[i].fare);
    printf("----------------------------------------\n");
}

void bookTicket(){
    struct ticket t;
    int tno=0, idx, seat, i;

    if(n>=MAX){
        printf("\nSorry, booking limit reached!\n");
        return;
    }

    showTrains();
    printf("\nEnter train number: ");
    scanf("%d",&tno);
    idx = findTrain(tno);
    if(idx==-1){
        printf("Invalid train number!!\n");
        return;
    }

    printf("Enter journey date (dd/mm/yyyy): ");
    scanf("%s",t.date);
    if(strlen(t.date)!=10 || t.date[2]!='/' || t.date[5]!='/'){
        printf("Wrong date format! use dd/mm/yyyy\n");
        return;
    }

    seat = getSeat(tno,t.date);
    if(seat==-1){
        printf("Sorry, no seats left in this train on %s\n",t.date);
        return;
    }

    printf("Enter passenger name: ");
    scanf(" %[^\n]",t.name);
    // comma will break the file so replacing it with space
    for(i=0;t.name[i]!='\0';i++){
        if(t.name[i]==',')
            t.name[i]=' ';
    }

    t.age = 0;
    printf("Enter age: ");
    scanf("%d",&t.age);
    if(t.age<=0 || t.age>120){
        printf("Invalid age!\n");
        return;
    }

    printf("Enter gender (M/F/O): ");
    scanf(" %c",&t.gender);
    t.gender = toupper(t.gender);
    if(t.gender!='M' && t.gender!='F' && t.gender!='O'){
        printf("Invalid gender!\n");
        return;
    }

    // fare calculation
    t.fare = tr[idx].fare;
    if(t.age<5)
        t.fare = 0;                          // small kids free
    else if(t.age<12)
        t.fare = t.fare/2;                   // half ticket
    else if(t.age>=60)
        t.fare = t.fare - (t.fare*30)/100;   // 30% senior citizen discount

    lastPnr++;
    t.pnr = lastPnr;
    t.trainNo = tno;
    t.seatNo = seat;

    tk[n] = t;
    n++;
    saveData();

    printf("\nTicket booked successfully!!");
    printTicket(n-1);
}

void cancelTicket(){
    int pnr=0, i, found=-1, refund;
    char ch;

    printf("\nEnter PNR number to cancel: ");
    scanf("%d",&pnr);

    for(i=0;i<n;i++){
        if(tk[i].pnr==pnr){
            found = i;
            break;
        }
    }
    if(found==-1){
        printf("No ticket found with PNR %d\n",pnr);
        return;
    }

    printTicket(found);
    printf("Are you sure you want to cancel this ticket? (y/n): ");
    scanf(" %c",&ch);

    if(ch=='y' || ch=='Y'){
        refund = tk[found].fare - (tk[found].fare*20)/100;   // 20% cancellation charge
        // shifting all tickets after it one place left
        for(i=found;i<n-1;i++){
            tk[i] = tk[i+1];
        }
        n--;
        saveData();
        printf("\nTicket cancelled. Refund amount: Rs %d\n",refund);
    }
    else{
        printf("Cancellation stopped.\n");
    }
}

void displayAll(){
    int i, total=0;
    if(n==0){
        printf("\nNo reservations yet.\n");
        return;
    }
    printf("\n%-6s %-20s %-4s %-3s %-7s %-5s %-12s %-6s\n","PNR","Name","Age","G","Train","Seat","Date","Fare");
    printf("----------------------------------------------------------------------\n");
    for(i=0;i<n;i++){
        printf("%-6d %-20s %-4d %-3c %-7d %-5d %-12s %-6d\n",tk[i].pnr,tk[i].name,tk[i].age,tk[i].gender,tk[i].trainNo,tk[i].seatNo,tk[i].date,tk[i].fare);
        total = total + tk[i].fare;
    }
    printf("----------------------------------------------------------------------\n");
    printf("Total tickets: %d\n",n);
    printf("Total amount collected: Rs %d\n",total);
}

void searchTicket(){
    int pnr=0, i;
    printf("\nEnter PNR number: ");
    scanf("%d",&pnr);
    for(i=0;i<n;i++){
        if(tk[i].pnr==pnr){
            printTicket(i);
            return;
        }
    }
    printf("No ticket found with this PNR!\n");
}

void checkSeats(){
    int tno=0, idx, i, count=0;
    char date[20];
    int booked[SEATS+1] = {0};

    printf("\nEnter train number: ");
    scanf("%d",&tno);
    idx = findTrain(tno);
    if(idx==-1){
        printf("Invalid train number!!\n");
        return;
    }
    printf("Enter date (dd/mm/yyyy): ");
    scanf("%s",date);

    for(i=0;i<n;i++){
        if(tk[i].trainNo==tno && strcmp(tk[i].date,date)==0){
            booked[tk[i].seatNo] = 1;
            count++;
        }
    }

    printf("\n%s (%d) on %s\n",tr[idx].name,tr[idx].no,date);
    printf("Booked: %d   Available: %d\n\n",count,SEATS-count);

    // seat chart, XX = booked
    for(i=1;i<=SEATS;i++){
        if(booked[i]==1)
            printf("[XX] ");
        else
            printf("[%2d] ",i);
        if(i%6==0)
            printf("\n");
    }
}

int main(){
    int ch;

    loadData();

    while(1){
        printf("\n\n========================================\n");
        printf("       RAILWAY RESERVATION SYSTEM\n");
        printf("========================================\n");
        printf(" 1. Show Trains\n");
        printf(" 2. Book Ticket\n");
        printf(" 3. Cancel Ticket\n");
        printf(" 4. Display All Reservations\n");
        printf(" 5. Search Ticket by PNR\n");
        printf(" 6. Check Seat Availability\n");
        printf(" 7. Exit\n");
        printf("Enter your choice: ");

        if(scanf("%d",&ch)!=1){
            while(getchar()!='\n');   // clear wrong input
            ch = 0;
        }

        switch(ch){
            case 1: showTrains(); break;
            case 2: bookTicket(); break;
            case 3: cancelTicket(); break;
            case 4: displayAll(); break;
            case 5: searchTicket(); break;
            case 6: checkSeats(); break;
            case 7:
                printf("\nThank you for using Railway Reservation System!\n");
                return 0;
            default:
                printf("\nInvalid choice, try again\n");
        }
    }
    return 0;
}
