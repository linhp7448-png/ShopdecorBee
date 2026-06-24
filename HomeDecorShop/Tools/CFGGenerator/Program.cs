using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace CFGGenerator;

class Program
{
    static void Main(string[] args)
    {
        if (args.Length < 1)
        {
            Console.WriteLine("Usage: CFGGenerator <source-file.cs> [output-directory]");
            return;
        }

        string sourceFile = args[0];
        string outputDir = args.Length > 1 ? args[1] : Path.GetDirectoryName(sourceFile) ?? ".";

        if (!File.Exists(sourceFile))
        {
            Console.WriteLine($"Error: File not found: {sourceFile}");
            return;
        }

        Console.WriteLine($"Parsing {sourceFile}...");

        var sourceCode = File.ReadAllText(sourceFile);
        var syntaxTree = CSharpSyntaxTree.ParseText(sourceCode);
        var root = syntaxTree.GetCompilationUnitRoot();

        var generator = new CFGGenerator();
        var cfgs = generator.GenerateCFGs(root);

        Console.WriteLine($"Found {cfgs.Count} methods.");

        foreach (var cfg in cfgs)
        {
            string fileName = $"{cfg.Key}.dot";
            string filePath = Path.Combine(outputDir, fileName);
            File.WriteAllText(filePath, cfg.Value);
            Console.WriteLine($"Generated: {filePath}");
        }

        Console.WriteLine("\nTo visualize the CFGs, use Graphviz:");
        Console.WriteLine("  dot -Tpng <method-name>.dot -o <method-name>.png");
    }
}

public class CFGGenerator
{
    private int _nodeId = 0;
    private StringBuilder _sb = new StringBuilder();

    public Dictionary<string, string> GenerateCFGs(CompilationUnitSyntax root)
    {
        var result = new Dictionary<string, string>();

        var classDeclarations = root.DescendantNodes().OfType<ClassDeclarationSyntax>();
        foreach (var classDecl in classDeclarations)
        {
            var methods = classDecl.DescendantNodes().OfType<MethodDeclarationSyntax>();
            foreach (var method in methods)
            {
                _nodeId = 0;
                _sb.Clear();
                
                string methodName = $"{classDecl.Identifier.Text}_{method.Identifier.Text}";
                _sb.AppendLine($"digraph \"{methodName}\" {{");
                _sb.AppendLine("  rankdir=TB;");
                _sb.AppendLine("  node [shape=box];");
                _sb.AppendLine("  start [label=\"Start\", shape=ellipse];");
                
                var startNode = GenerateCFGForMethod(method);
                
                _sb.AppendLine("  end [label=\"End\", shape=ellipse];");
                _sb.AppendLine("}");

                result[methodName] = _sb.ToString();
            }
        }

        return result;
    }

    private int GenerateCFGForMethod(MethodDeclarationSyntax method)
    {
        var body = method.Body;
        if (body == null) return -1;

        return GenerateCFGForStatement(body);
    }

    private int GenerateCFGForStatement(StatementSyntax statement)
    {
        return statement switch
        {
            BlockSyntax block => GenerateCFGForBlock(block),
            IfStatementSyntax ifStmt => GenerateCFGForIf(ifStmt),
            ForStatementSyntax forStmt => GenerateCFGForLoop(forStmt, "for"),
            WhileStatementSyntax whileStmt => GenerateCFGForLoop(whileStmt, "while"),
            ForeachStatementSyntax foreachStmt => GenerateCFGForLoop(foreachStmt, "foreach"),
            DoStatementSyntax doStmt => GenerateCFGForDoLoop(doStmt),
            SwitchStatementSyntax switchStmt => GenerateCFGForSwitch(switchStmt),
            ReturnStatementSyntax returnStmt => GenerateCFGForReturn(returnStmt),
            ExpressionStatementSyntax exprStmt => GenerateCFGForExpression(exprStmt),
            _ => GenerateCFGForGenericStatement(statement)
        };
    }

    private int GenerateCFGForBlock(BlockSyntax block)
    {
        int entryNode = _nodeId;
        int lastNode = entryNode;

        foreach (var stmt in block.Statements)
        {
            int node = GenerateCFGForStatement(stmt);
            if (lastNode != -1 && node != -1)
            {
                _sb.AppendLine($"  node_{lastNode} -> node_{node};");
            }
            lastNode = node;
        }

        return entryNode;
    }

    private int GenerateCFGForIf(IfStatementSyntax ifStmt)
    {
        int conditionNode = _nodeId++;
        string conditionText = ifStmt.Condition?.ToString() ?? "condition";
        _sb.AppendLine($"  node_{conditionNode} [label=\"if ({conditionText})\"];");

        int trueNode = GenerateCFGForStatement(ifStmt.Statement);
        _sb.AppendLine($"  node_{conditionNode} -> node_{trueNode} [label=\"true\"];");

        int falseNode = -1;
        if (ifStmt.Else != null)
        {
            falseNode = GenerateCFGForStatement(ifStmt.Else.Statement);
            _sb.AppendLine($"  node_{conditionNode} -> node_{falseNode} [label=\"false\"];");
        }
        else
        {
            int skipNode = _nodeId++;
            _sb.AppendLine($"  node_{skipNode} [label=\"skip\", shape=diamond];");
            _sb.AppendLine($"  node_{conditionNode} -> node_{skipNode} [label=\"false\"];");
            falseNode = skipNode;
        }

        int mergeNode = _nodeId++;
        _sb.AppendLine($"  node_{mergeNode} [label=\"merge\", shape=diamond];");
        _sb.AppendLine($"  node_{trueNode} -> node_{mergeNode};");
        _sb.AppendLine($"  node_{falseNode} -> node_{mergeNode};");

        return conditionNode;
    }

    private int GenerateCFGForLoop(StatementSyntax loopStmt, string loopType)
    {
        var condition = loopType switch
        {
            "for" => ((ForStatementSyntax)loopStmt).Condition?.ToString(),
            "while" => ((WhileStatementSyntax)loopStmt).Condition?.ToString(),
            "foreach" => ((ForeachStatementSyntax)loopStmt).Expression?.ToString(),
            _ => null
        };

        int conditionNode = _nodeId++;
        _sb.AppendLine($"  node_{conditionNode} [label=\"{loopType} ({condition})\"];");

        var body = loopType switch
        {
            "for" => ((ForStatementSyntax)loopStmt).Body,
            "while" => ((WhileStatementSyntax)loopStmt).Body,
            "foreach" => ((ForeachStatementSyntax)loopStmt).Statement,
            _ => null
        };

        int bodyNode = GenerateCFGForStatement(body!);
        _sb.AppendLine($"  node_{conditionNode} -> node_{bodyNode} [label=\"true\"];");
        _sb.AppendLine($"  node_{bodyNode} -> node_{conditionNode} [label=\"loop\"];");

        int exitNode = _nodeId++;
        _sb.AppendLine($"  node_{exitNode} [label=\"exit {loopType}\"];");
        _sb.AppendLine($"  node_{conditionNode} -> node_{exitNode} [label=\"false\"];");

        return conditionNode;
    }

    private int GenerateCFGForDoLoop(DoStatementSyntax doStmt)
    {
        int bodyNode = GenerateCFGForStatement(doStmt.Statement);
        
        int conditionNode = _nodeId++;
        string conditionText = doStmt.Condition?.ToString() ?? "condition";
        _sb.AppendLine($"  node_{conditionNode} [label=\"while ({conditionText})\"];");
        
        _sb.AppendLine($"  node_{bodyNode} -> node_{conditionNode};");
        _sb.AppendLine($"  node_{conditionNode} -> node_{bodyNode} [label=\"true\"];");

        int exitNode = _nodeId++;
        _sb.AppendLine($"  node_{exitNode} [label=\"exit do-while\"];");
        _sb.AppendLine($"  node_{conditionNode} -> node_{exitNode} [label=\"false\"];");

        return bodyNode;
    }

    private int GenerateCFGForSwitch(SwitchStatementSyntax switchStmt)
    {
        int switchNode = _nodeId++;
        string exprText = switchStmt.Expression?.ToString() ?? "expr";
        _sb.AppendLine($"  node_{switchNode} [label=\"switch ({exprText})\"];");

        List<int> caseNodes = new List<int>();
        foreach (var section in switchStmt.Sections)
        {
            int caseNode = _nodeId++;
            string labels = string.Join(", ", section.Labels.Select(l => l.ToString()));
            _sb.AppendLine($"  node_{caseNode} [label=\"case {labels}\"];");
            _sb.AppendLine($"  node_{switchNode} -> node_{caseNode};");

            int stmtNode = GenerateCFGForBlock(new BlockSyntax { Statements = new SyntaxList<StatementSyntax>(section.Statements) });
            _sb.AppendLine($"  node_{caseNode} -> node_{stmtNode};");
            caseNodes.Add(stmtNode);
        }

        int mergeNode = _nodeId++;
        _sb.AppendLine($"  node_{mergeNode} [label=\"merge switch\", shape=diamond];");
        foreach (var caseNode in caseNodes)
        {
            _sb.AppendLine($"  node_{caseNode} -> node_{mergeNode};");
        }

        return switchNode;
    }

    private int GenerateCFGForReturn(ReturnStatementSyntax returnStmt)
    {
        int node = _nodeId++;
        string exprText = returnStmt.Expression?.ToString() ?? "void";
        _sb.AppendLine($"  node_{node} [label=\"return {exprText}\", shape=ellipse];");
        _sb.AppendLine($"  node_{node} -> end;");
        return node;
    }

    private int GenerateCFGForExpression(ExpressionStatementSyntax exprStmt)
    {
        int node = _nodeId++;
        string exprText = exprStmt.Expression?.ToString() ?? "expr";
        _sb.AppendLine($"  node_{node} [label=\"{exprText}\"];");
        return node;
    }

    private int GenerateCFGForGenericStatement(StatementSyntax stmt)
    {
        int node = _nodeId++;
        _sb.AppendLine($"  node_{node} [label=\"{stmt.GetType().Name}\"];");
        return node;
    }
}
