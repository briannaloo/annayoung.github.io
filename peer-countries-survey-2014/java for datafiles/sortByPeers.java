/*
File: sortByPeers.c
Author: Anna Young
*/

import java.io.*;
import java.util.*;

public class sortByPeers
{
	public static void main(String[] args) throws IOException 
	{
		// read in data
		String file = "original data/peer data rotated.csv";
		Scanner scan = new Scanner(new File(file));
		String header = scan.nextLine();
		String[] countries = header.split(",");
		int num_columns = countries.length - 1;

		// load countries
		int[][] matrix = new int[num_columns][num_columns];
		loadCountries(matrix, countries, scan, num_columns);

		// print to file
		PrintWriter data = new PrintWriter("Peers.csv", "UTF-8");
		printCSV(data, matrix, num_columns, countries);

		// sort by peers
		String[] groups = new String[num_columns];
		for (int i = 0; i < num_columns; i++)
			groups[i] = "";
		String[] best = backtracking(matrix, countries, groups, groups, 0, 0, 0);

		// print result
		for (int group = 0; group < best.length && !best[group].equals(""); group++)
		{
			System.out.println(best[group]);
		}
	}

	public static String[] backtracking (int[][] matrix, String[] countries, String[] groups, String[] best, int best_so_far, int current_fitness, int counter)
	{
		// keep placing countries until none left
		if (counter < countries.length-1)
		{
			// loop through each group can place country into
			boolean stop = false;
			for (int group = 0; group < groups.length && !stop; group++)
			{
				String previous = groups[group];
				groups[group] += (counter + ",");
				current_fitness = calculateFitness(matrix, groups);
				best = backtracking(matrix, countries, groups, best, best_so_far, current_fitness, counter+1);
				groups[group] = previous;

				if (groups[group].equals(""))	// so don't try empty group too many times
					stop = true;
			}
		}
		else
		{
			if (current_fitness < best_so_far)
				best = groups;
		}
		return best;
	}

	public static int calculateFitness (int[][] matrix, String[] groups)
	{
		int fitness = 0;
		for (int group = 0; group < groups.length && !groups[group].equals(""); group++)
		{
			int num_peers = 0;
			String[] countries = groups[group].split(",");
			for (int i = 0; i < countries.length; i++)
			{
				int origin = Integer.parseInt(countries[i]);
				for (int j = 0; j < countries.length; j++)
				{
					int peer = Integer.parseInt(countries[j]);
					if (matrix[i][j] == 1)
						num_peers++;
				}
			}

			fitness += num_peers;
		}
		return fitness;
	}

	public static void loadCountries (int[][] matrix, String[] countries, Scanner scan, int length)
	{
		//initialize
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				matrix[i][j] = 0;
			}
		}

		// load country data
		while (scan.hasNextLine())						// for each country (data point)				
		{
			String line = scan.nextLine();	
			String peers[] = line.split(",");			// asked about these countries
			String country = peers[0];

			int origin = getIndex(country, countries);
			for (int i = 1; i < peers.length; i++)
			{
				if (peers[i].equals("1"))
				{
					int destination = i-1;
					if (origin != destination)	// so no self-mutual relationships
						matrix[origin][destination] = 1;
				}
			}
		}


		/*// only mutual relationships (separate matrix)
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				if (matrix[i][j] == 1 && matrix[j][i] == 1
					&& mutual_matrix[j][i] != 1 // only one of them is taken as 1 (so no duplicates)
					&& i != j)	// so no self-mutual relationships
					mutual_matrix[i][j] = 1;	
			}
		}

		// rejected peer (separate matrix)
		for (int i = 0; i < length; i++)
		{
			for (int j = 0; j < length; j++)
			{
				if (matrix[i][j] == 1 && matrix[j][i] == 0	
					&& hasData(matrix, j, length))
					rejected_matrix[i][j] = 1;	
			}
		}*/
	}

	public static boolean hasData (int[][] matrix, int index, int length)
	{
		for (int i = 0; i < length; i++)
		{
			if (matrix[index][i] != 0)
				return true;
		}
		return false;
	}

	public static int getIndex(String country, String[] countries)
	{
		for (int i = 1; i < countries.length; i++)
		{
			if (countries[i].equals(country))
				return (i-1);
		}
		return -1;
	}

	public static void printCSV (PrintWriter csv, int[][] matrix, int length, String[] countries) throws IOException 
	{
		//csv.print("Countries");
		for (int i = 1; i < countries.length; i++)
		{
			csv.print("," + countries[i]);
		}
		csv.println();

		for (int i = 0; i < length; i++)
		{
			csv.print(countries[i+1]);
			for (int j = 0; j < length; j++)
			{
				csv.print("," + matrix[i][j]);
			}
			csv.println();
		}
		csv.println();
		csv.flush();
		csv.close();
	}

}

