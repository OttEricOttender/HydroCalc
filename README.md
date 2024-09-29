# Hydrological Parameters Calculator

## Product Vision

### Primary Questions
* **What is the product to be developed? What type of system it will be (e.g. a Web API, a Web frontend, a mobile app, a desktop app?) and what will the system allow its users to achieve?**
  - The product will be a web application which will calculate necessary drainage-related parameters like catchment area size and river system length at the user's desired point to automate the work of environmental scientists, landscape planners and hydraulic engineers and make it more percise.
* **What makes this product different from competing products?**
  - It will differ from other competing products by being Estonia specific and automatically calculating the desired parameters instead of making the user calculate them themself.
* **Why should customers buy this product? What problem it will solve or what opportunity is it meant to exploit?** 
  - The customers should buy this project to not only save up time needed to calculate the parameters but also make the calculation more percise. Right now, if an environmental engineer wants to know the drainage parameters of a certain spot, they would have to search for data from multiple different databases and then make a calculation which involves a lot of summarizations and "eye-balling". This will be solved by making the application search for all the necessary parameters and making the calculations.
* **Who are the target customers and users?**
  - Target customers and users include: environmental researchers and scientists; various engineers; construction consultants; city designers and planners.

### Moore's template
**FOR** hydraulic engineers, environmental scientists, and researchers at both the public and private sector involved in drainage and water management **WHO** need an automated tool to calculate key drainage-related parameters at a coordinate point. **THE** hydrological parameters calculator **THAT** will greatly streamline hydrological assessments for drainage and water management purposes. **UNLIKE** the current situation where obtaining these parameters requires manual input and analysis, which can be time-consuming and prone to errors, **OUR** hydrological parameters calculator will take human-error out of the process and make it faster by utilizing the existing geospatial datasets and -bases to calculate relevant parameters such as catchment area size, river system length, average slope of the catchment, land use characteristics and much more.


## Scope

**Disclaimer: All tasks inside the iterations are ordered by time priority with tasks that can (and should) be completed first at the top and tasks that can (and should) be completed last at the bottom.**

### Iteration 1 (4 people, 2 weeks, estimated time: X hours, actual working time: )

* **Setting up the GitHub repository and project for project management (Priority: Must-have, Estimated: 3 hours, Actual: hours)**
  - Creating the repository and project (Estimated: 0.5 hours, Actual: hours)
  - Creating necessary labels for both repository and project (Estimated: 1 hour, Actual: hours)
  - Grouping the tasks into functional requirements, non-functional requirements and user-stories (Estimated: 0.5 hours, Actual: hours)
  - Assigining the tasks to team members (Estimated: 0.5 hours, Actual: hours)

* **Creating a Wiki/ReadMe File (Priority: Must-have, Estimated: 4 hours, Actual: hours)**
  - Discussing and assigning roles for the project (Estimated: 0.5 hours, Actual: hours)
  - Gathering and discussing necessary information on what to include in the Wiki (Estimated: 0.5 hours, Actual: hours)
  - Writing the Product Vision (Estimated: 0.5 hours, Actual: hours)
  - Discussing and explaining the work process (Estimated: 1 hour, Actual: hours)
  - Writing the Scope (Estimated: 2 hours, Actual: hours)
    
* **Document at least 24 functional requirements (Priority: Must-have, Estimated: 8 hours, Actual: hours)**
  - Initial exchange of information with the customer via email (Estimated: 0.5 hours, Actual: hours)
  - First web-meeting with the customer (Estimated: 1 hour, Actual: hours)
  - Discussing and writing the requirements with the team (Estimated: 6 hours, Actual: hours).

* **Document at least 7 non-functional requirements (Priority: Must-have, Estimated: 4 hours, Actual: hours)**
  - Initial exchange of information with the customer via email (Estimated: 0.5 hours, Actual: hours)
  - First web-meeting with the customer (Estimated: 1 hour, Actual: hours)
  - Discussing and writing the non-functional requirements with the team (Estimated: 2 hours, Actual: hours).

* **Document at least 2 use cases (Priority: Must-have, Estimated: 2 hours, Actual: hours)**
  - Analyzing the functional requirements and choosing 2 high-level functional requirements (Estimated: 0.5 hours, Actual: hours)
  - Further detail the 2 high-level functional requirements (Estimated: 0.5 hours, Actual: hours)
  - Writing them as a seperate entry into the Wiki (Estimated: 0.5 hours, Actual: hours)


### Iteration 2 (4 people, 2 week, X hours)

* **The functionality of the application covers at least one of the core use cases and is tested (Priority: X, Estimated: Y hours, Actual: Z hours)**
* **Creation of Continuous Itegration system (Priority: X, Estimated: Y hours, Actual: Z hours)**
* **At least 75% of the requirements identified and marked as in the scope of the work delivered at the end of the course are detailed in the form of use cases (Priority: X, Estimated: Y hours, Actual: Z hours)**
* **The application UI has been prototyped using wireframes or mockups and there are links from the detailed requirements to the corresponding UI screens (Priority: X, Estimated: Y hours, Actual: Z hours)**
* **Release notes for this iteration are present (Priority: X, Estimated: Y hours, Actual: Z hours)**
* **Updates to Wiki (Priority: X, Estimated: Y hours, Actual: Z hours)**

### Iteration 3 (4 people, 2 week, X hours)

* **The functionality in the application covers all core use cases, is tested and works**
* **Creation of automated tests**
* **Addition of automated tests to CI**
* **Finalization of all requirements and creation of UI prototypes**
* **Updates to Wiki**

### Iteration 4 (4 people, 2 week, X hours)

* **The functionality in the application covers all requirements defined by functional and non-functional requirements. They are tested and working.**
* **Automated testing for new functionalities.**
* **Addition of more automated tests to CI**
* **Conduct internal acceptance testing prior to the release.**
* **Verification of non-functional requirements**
* **Response to the peer-review.**
* **Updates to Wiki**

## Stack
* Database: PostgreSQL
* Back-end: Python
* Front-end: PHP/React.js

## About the team
### Members
* Ott Eric Ottender (Team lead, Lead Requirements Engineer, Programmer, Tester)
* Lauri Kuresoo (Lead Tester, Requirements Engineer, Programmer)
* Robert Ivask (Lead Programmer, Requirements Engineer, Programmer)
* Rasmus Meos (Programmer, Requirements Engineer, Programmer)

### Communication
On a day-to-day basis the communication takes place in a groupchat. Every week, we might briefly meet as a team via Google Meets or Zoom to further discuss topics which can't be or might be too lenghty to resolve in the groupchat. As for the client, we will keep in contact with the client on a weekly basis via emails clarifying the questions each side might come up with. Again, when there's a need for a bigger and longer discussion, we will meet via Google Meets or Zoom.

### Work Process
* How and using what materials the customer is going to understand what you are going to build?
  - The customer has a very clear vision of what they wish to achieve with our project. They already use the tools that the program should utilize in every day working. Our job is to automate the whole process so that they don't have to hop between multiple different databases and information sources to determine their desired hydrological parameters. 

* How do you determine that the customer is accepting your solution proposal?
  - Before starting to implement any further moves, we will coordinate it witht he customer. They know how to use the databases necessary for the project's work so their explanation serves as approval and acceptance of how the problem should be solved.
    
* How you are internally going to build the accepted solution (who assigns the tasks, who is going to implement it, will the tests be written, will code be reviewed, who is going to verify, who is doing the validation, etc.)?
  - The tasks will be assigned by the current split’s lead. They will also do most of the work during that split (75 hours) with other team members supporting him with 50 hours, 50 hours and 25 hours respectively. These hours will shift depending on the split so that everybody would equal at least 150 hours by the end of course. The code will be reviewed, verified and validated also primarily by the split lead, assisted by other team members, who might have a fresher look at the work that was done during that iteration/split. How testing will work is up for the testing lead to decide.
 
* When do you consider something ready to be delivered to the customer for review?
  - A function or an element of the application is ready to be delivered and demonstrated to the customer when the function or element has no errors or 1-2 minor errors which do not alter the application in a significant manner and may not be visible unless specifically tested for. Regardless of the visibility, it will still be communicated to the customer and fixed at the earliest possibility.

* How do you gather feedback from the customer and/or end users?
  - Feedback will be gathered by asking for the client’s opinion after a demo session or an improvement in the project’s work. After the customer has given the approval to seek people outside of the development team and customer team to test the application, the feedback will be collected via a survey. This is subject to change depending on the customer’s and testing lead’s wishes.
 
* What is the definition of DONE on a task?
  - A DONE task is something that needs no further work in the current iteration. It must also be confirmed by other team members through review.


