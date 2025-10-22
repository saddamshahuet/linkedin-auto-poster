#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class WindowsTaskSchedulerSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..', '..');
    this.nodePath = process.execPath; // Path to node.exe
    this.taskPrefix = 'LinkedInAutoPoster';
    
    console.log('🔧 Windows Task Scheduler Setup');
    console.log(`Project Root: ${this.projectRoot}`);
    console.log(`Node Path: ${this.nodePath}`);
  }

  async createPostGeneratorTask() {
    const taskName = `${this.taskPrefix}_PostGenerator`;
    const scriptPath = path.join(this.projectRoot, 'src', 'scheduler', 'autonomous-post-generator.js');
    
    const taskXml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>2025-09-29T12:00:00</Date>
    <Author>LinkedIn Auto Poster</Author>
    <Description>Autonomous post generation for LinkedIn Auto Poster</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2025-09-29T09:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
      <Repetition>
        <Interval>PT6H</Interval>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions>
    <Exec>
      <Command>"${this.nodePath}"</Command>
      <Arguments>"${scriptPath}" daily-batch</Arguments>
      <WorkingDirectory>${this.projectRoot}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;

    return { taskName, taskXml };
  }

  async createPostPublisherTask() {
    const taskName = `${this.taskPrefix}_PostPublisher`;
    const scriptPath = path.join(this.projectRoot, 'src', 'scheduler', 'autonomous-post-publisher.js');
    
    const taskXml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>2025-09-29T12:00:00</Date>
    <Author>LinkedIn Auto Poster</Author>
    <Description>Autonomous post publishing for LinkedIn Auto Poster</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <StartBoundary>2025-09-29T10:00:00</StartBoundary>
      <Enabled>true</Enabled>
      <ScheduleByWeek>
        <WeeksInterval>1</WeeksInterval>
        <DaysOfWeek>
          <Monday />
          <Tuesday />
          <Wednesday />
          <Thursday />
          <Friday />
        </DaysOfWeek>
      </ScheduleByWeek>
      <Repetition>
        <Interval>PT6H</Interval>
        <Duration>PT12H</Duration>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT30M</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions>
    <Exec>
      <Command>"${this.nodePath}"</Command>
      <Arguments>"${scriptPath}" publish-next</Arguments>
      <WorkingDirectory>${this.projectRoot}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;

    return { taskName, taskXml };
  }

  async createMainSchedulerTask() {
    const taskName = `${this.taskPrefix}_MainScheduler`;
    const scriptPath = path.join(this.projectRoot, 'src', 'scheduler', 'autonomous-scheduler.js');
    
    const taskXml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>2025-09-29T12:00:00</Date>
    <Author>LinkedIn Auto Poster</Author>
    <Description>Main autonomous scheduler for LinkedIn Auto Poster</Description>
  </RegistrationInfo>
  <Triggers>
    <BootTrigger>
      <Enabled>true</Enabled>
      <Delay>PT2M</Delay>
    </BootTrigger>
    <LogonTrigger>
      <Enabled>true</Enabled>
      <Delay>PT1M</Delay>
    </LogonTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>false</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>P1D</ExecutionTimeLimit>
    <Priority>7</Priority>
    <RestartOnFailure>
      <Interval>PT15M</Interval>
      <Count>3</Count>
    </RestartOnFailure>
  </Settings>
  <Actions>
    <Exec>
      <Command>"${this.nodePath}"</Command>
      <Arguments>"${scriptPath}" start</Arguments>
      <WorkingDirectory>${this.projectRoot}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;

    return { taskName, taskXml };
  }

  async createTask(taskName, taskXml) {
    try {
      // Create temporary XML file
      const tempDir = path.join(this.projectRoot, 'temp');
      await fs.ensureDir(tempDir);
      
      const tempXmlFile = path.join(tempDir, `${taskName}.xml`);
      await fs.writeFile(tempXmlFile, taskXml, 'utf16le');
      
      // Delete existing task if it exists
      try {
        await execAsync(`schtasks /delete /tn "${taskName}" /f`);
        console.log(`✅ Deleted existing task: ${taskName}`);
      } catch (error) {
        // Task doesn't exist, that's fine
      }
      
      // Create new task
      const createCommand = `schtasks /create /tn "${taskName}" /xml "${tempXmlFile}"`;
      await execAsync(createCommand);
      
      console.log(`✅ Created task: ${taskName}`);
      
      // Clean up temp file
      await fs.remove(tempXmlFile);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to create task ${taskName}:`, error.message);
      return false;
    }
  }

  async setupAllTasks() {
    console.log('\n🔧 Setting up Windows Task Scheduler tasks...');
    
    try {
      // Check if running as administrator
      try {
        await execAsync('net session >nul 2>&1');
      } catch (error) {
        console.error('❌ This script must be run as Administrator');
        return false;
      }
      
      const tasks = [
        await this.createPostGeneratorTask(),
        await this.createPostPublisherTask(),
        await this.createMainSchedulerTask()
      ];
      
      let successCount = 0;
      
      for (const { taskName, taskXml } of tasks) {
        const success = await this.createTask(taskName, taskXml);
        if (success) {
          successCount++;
        }
      }
      
      console.log(`\n✅ Successfully created ${successCount}/${tasks.length} tasks`);
      
      if (successCount === tasks.length) {
        console.log('\n📋 Tasks created:');
        console.log(`  - ${this.taskPrefix}_PostGenerator: Generates posts every 6 hours`);
        console.log(`  - ${this.taskPrefix}_PostPublisher: Publishes posts on weekdays every 6 hours`);
        console.log(`  - ${this.taskPrefix}_MainScheduler: Main scheduler (starts on boot/login)`);
        
        console.log('\n🎯 Next steps:');
        console.log('  1. Configure your .env file with credentials');
        console.log('  2. Test the tasks manually first');
        console.log('  3. Monitor the logs for proper operation');
        console.log('\n📝 Manage tasks:');
        console.log('  - Open Task Scheduler: taskschd.msc');
        console.log('  - Look for "LinkedInAutoPoster" tasks');
        console.log('  - Right-click tasks to run/disable/modify');
      }
      
      return successCount === tasks.length;
      
    } catch (error) {
      console.error('❌ Error setting up tasks:', error);
      return false;
    }
  }

  async removeAllTasks() {
    console.log('\n🗑️  Removing Windows Task Scheduler tasks...');
    
    const taskNames = [
      `${this.taskPrefix}_PostGenerator`,
      `${this.taskPrefix}_PostPublisher`,
      `${this.taskPrefix}_MainScheduler`
    ];
    
    let removedCount = 0;
    
    for (const taskName of taskNames) {
      try {
        await execAsync(`schtasks /delete /tn "${taskName}" /f`);
        console.log(`✅ Removed task: ${taskName}`);
        removedCount++;
      } catch (error) {
        console.log(`⚠️  Task not found or already removed: ${taskName}`);
      }
    }
    
    console.log(`\n✅ Removed ${removedCount} tasks`);
  }

  async listTasks() {
    console.log('\n📋 LinkedIn Auto Poster Tasks:');
    
    try {
      const { stdout } = await execAsync(`schtasks /query /tn "${this.taskPrefix}*" /fo csv`);
      const lines = stdout.split('\n').filter(line => line.includes(this.taskPrefix));
      
      if (lines.length === 0) {
        console.log('  No tasks found');
      } else {
        lines.forEach(line => {
          const parts = line.split(',');
          if (parts.length > 0) {
            const taskName = parts[0].replace(/"/g, '');
            const status = parts[2] ? parts[2].replace(/"/g, '') : 'Unknown';
            console.log(`  - ${taskName}: ${status}`);
          }
        });
      }
    } catch (error) {
      console.log('  No tasks found or error querying tasks');
    }
  }

  async generateBatchFiles() {
    console.log('\n📄 Generating batch files for manual execution...');
    
    const batchFiles = [
      {
        name: 'generate-posts.bat',
        content: `@echo off
cd /d "${this.projectRoot}"
"${this.nodePath}" "${path.join(this.projectRoot, 'src', 'scheduler', 'autonomous-post-generator.js')}" daily-batch
pause`
      },
      {
        name: 'publish-posts.bat',
        content: `@echo off
cd /d "${this.projectRoot}"
"${this.nodePath}" "${path.join(this.projectRoot, 'src', 'scheduler', 'autonomous-post-publisher.js')}" publish-next
pause`
      },
      {
        name: 'start-scheduler.bat',
        content: `@echo off
cd /d "${this.projectRoot}"
"${this.nodePath}" "${path.join(this.projectRoot, 'src', 'scheduler', 'autonomous-scheduler.js')}" start
pause`
      }
    ];
    
    for (const { name, content } of batchFiles) {
      const filePath = path.join(this.projectRoot, name);
      await fs.writeFile(filePath, content);
      console.log(`✅ Created: ${name}`);
    }
    
    console.log('\n🎯 Batch files created for manual testing');
  }
}

// Command-line interface
async function main() {
  const setup = new WindowsTaskSchedulerSetup();
  
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';
  
  switch (command) {
    case 'setup':
      const success = await setup.setupAllTasks();
      if (!success) {
        process.exit(1);
      }
      break;
      
    case 'remove':
      await setup.removeAllTasks();
      break;
      
    case 'list':
      await setup.listTasks();
      break;
      
    case 'batch':
      await setup.generateBatchFiles();
      break;
      
    default:
      console.log(`
🔧 Windows Task Scheduler Setup

Usage:
  node setup-task-scheduler.js [command]

Commands:
  setup    Set up all scheduled tasks (default)
  remove   Remove all scheduled tasks
  list     List existing tasks
  batch    Generate batch files for manual testing

Note: Must run as Administrator to create/modify scheduled tasks

Examples:
  node setup-task-scheduler.js setup
  node setup-task-scheduler.js remove
  node setup-task-scheduler.js list
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = WindowsTaskSchedulerSetup;