const { exec } = require("child_process");
const fs = require("fs");

exports.runCode = (req, res) => {
  let { language, code } = req.body;

  if (!code) {
    return res.json({ output: "No code provided" });
  }

  language = language.toLowerCase().trim();

  // ✅ JAVASCRIPT (console.log capture)
  if (language === "javascript" || language === "js") {
    try {
      let output = "";

      const originalLog = console.log;

      console.log = (...args) => {
        output += args.join(" ") + "\n";
      };

      eval(code);

      console.log = originalLog;

      return res.json({ output: output || "No output" });

    } catch (err) {
      return res.json({ output: err.message });
    }
  }

  // ✅ PYTHON
  if (language === "python") {
    fs.writeFileSync("temp.py", code);

    exec("python temp.py", (err, stdout, stderr) => {
      if (stderr) return res.json({ output: stderr });
      if (err) return res.json({ output: err.message });

      return res.json({ output: stdout });
    });

    return;
  }

  // ✅ C++
  if (language === "cpp") {
    fs.writeFileSync("temp.cpp", code);

    exec("g++ temp.cpp -o temp.exe && temp.exe", (err, stdout, stderr) => {
      if (stderr) return res.json({ output: stderr });
      if (err) return res.json({ output: err.message });

      return res.json({ output: stdout });
    });

    return;
  }

  // ✅ JAVA
  if (language === "java") {
    fs.writeFileSync("Main.java", code);

    exec("javac Main.java && java Main", (err, stdout, stderr) => {
      if (stderr) return res.json({ output: stderr });
      if (err) return res.json({ output: err.message });

      return res.json({ output: stdout });
    });

    return;
  }

  // ❌ fallback
  return res.json({ output: "Language not supported yet" });
};